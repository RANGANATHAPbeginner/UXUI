import os
import uuid
import PyPDF2
import docx
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import sys

# Download NLTK data (run once)
# nltk.download('punkt')
# nltk.download('stopwords')

class ResumeAnalyzer:
    def __init__(self):
        self.required_skills = {
            'technical': ['javascript', 'python', 'java', 'react', 'node.js', 'html', 'css', 
                         'sql', 'mongodb', 'git', 'aws', 'docker', 'kubernetes'],
            'soft': ['communication', 'leadership', 'problem solving', 'teamwork', 
                    'adaptability', 'creativity', 'time management']
        }
    
    def extract_text_from_pdf(self, file_path):
        """Extract text from PDF file"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text()
                return text
        except Exception as e:
            # Redirect errors to stderr
            print(f"Error reading PDF: {e}", file=sys.stderr)
            return ""
    
    def extract_text_from_docx(self, file_path):
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            print(f"Error reading DOCX: {e}", file=sys.stderr)
            return ""
    
    def extract_text_from_txt(self, file_path):
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            print(f"Error reading TXT: {e}", file=sys.stderr)
            return ""
    
    def extract_text(self, file_path):
        """Extract text based on file type"""
        filename = os.path.basename(file_path)
        if filename.lower().endswith('.pdf'):
            return self.extract_text_from_pdf(file_path)
        elif filename.lower().endswith(('.docx', '.doc')):
            return self.extract_text_from_docx(file_path)
        elif filename.lower().endswith('.txt'):
            return self.extract_text_from_txt(file_path)
        else:
            return ""
    
    def preprocess_text(self, text):
        """Clean and preprocess text"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and digits
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Remove stopwords
        stop_words = set(stopwords.words('english'))
        filtered_tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
        
        return ' '.join(filtered_tokens)
    
    def extract_skills(self, text):
        """Extract skills from resume text"""
        found_skills = []
        text_lower = text.lower()
        
        for skill_category, skills in self.required_skills.items():
            for skill in skills:
                if skill in text_lower:
                    found_skills.append({
                        'name': skill,
                        'category': skill_category,
                        'found': True
                    })
        
        return found_skills
    
    def calculate_match_score(self, resume_text, job_description):
        """Calculate match score between resume and job description"""
        # Preprocess texts
        processed_resume = self.preprocess_text(resume_text)
        processed_jd = self.preprocess_text(job_description)
        
        # Create TF-IDF vectors
        vectorizer = TfidfVectorizer()
        try:
            if not processed_resume or not processed_jd:
                return 0
            tfidf_matrix = vectorizer.fit_transform([processed_resume, processed_jd])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            # Convert to percentage
            match_score = round(similarity * 100, 2)
        except ValueError:
            match_score = 0
        
        return max(0, min(100, match_score))
    
    def analyze_experience(self, text):
        """Analyze experience level from resume text"""
        # Simple regex pattern for experience
        experience_pattern = r'(\d+)\s*\+?\s*years?'
        matches = re.findall(experience_pattern, text.lower())
        
        if matches:
            max_experience = max([int(match) for match in matches])
            if max_experience >= 5:
                return "Senior", "High"
            elif max_experience >= 3:
                return "Mid-level", "High"
            elif max_experience >= 1:
                return "Junior", "Medium"
        
        return "Entry-level", "Low"
    
    def generate_recommendations(self, resume_text, job_description, skills_found):
        """Generate AI-powered recommendations"""
        recommendations = []
        
        # Check for missing technical skills
        found_skill_names = [skill['name'] for skill in skills_found]
        missing_skills = [skill for skill in self.required_skills['technical'] 
                         if skill not in found_skill_names]
        
        if missing_skills:
            recommendations.append({
                "title": "Add Missing Technical Skills",
                "description": f"Consider gaining experience with: {', '.join(missing_skills[:3])}"
            })
        
        # Check for experience keywords
        if 'experience' not in resume_text.lower():
            recommendations.append({
                "title": "Highlight Professional Experience",
                "description": "Add a dedicated experience section with detailed role descriptions and achievements."
            })
        
        # Check for quantifiable achievements
        if not re.search(r'\d+', resume_text):  # Look for numbers
            recommendations.append({
                "title": "Quantify Your Achievements",
                "description": "Add metrics to your experience (e.g., 'Improved performance by 30%', 'Managed team of 5 people')."
            })
        
        # Check resume length
        word_count = len(resume_text.split())
        if word_count < 200:
            recommendations.append({
                "title": "Expand Your Resume Content",
                "description": "Your resume seems brief. Consider adding more details about your projects and responsibilities."
            })
        
        return recommendations

def main():
    if len(sys.argv) != 3:
        print("Usage: python app.py <file_path> <job_description>", file=sys.stderr)
        sys.exit(1)
        
    file_path = sys.argv[1]
    job_description = sys.argv[2]
    
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}", file=sys.stderr)
        sys.exit(1)

    analyzer = ResumeAnalyzer()
    
    # Extract text from resume
    resume_text = analyzer.extract_text(file_path)
    
    if not resume_text.strip():
        print("Could not extract text from resume", file=sys.stderr)
        sys.exit(1)
    
    # Perform analysis
    match_score = analyzer.calculate_match_score(resume_text, job_description)
    skills_found = analyzer.extract_skills(resume_text)
    experience_level, experience_match = analyzer.analyze_experience(resume_text)
    recommendations = analyzer.generate_recommendations(resume_text, job_description, skills_found)
    
    # Calculate skills match percentage
    total_skills = len(analyzer.required_skills['technical'])
    matched_skills = len([s for s in skills_found if s['category'] == 'technical'])
    skills_match_percentage = round((matched_skills / total_skills) * 100) if total_skills > 0 else 0
    
    # Prepare response
    analysis_result = {
        'match_score': match_score,
        'skills_found': skills_found,
        'skills_match_percentage': skills_match_percentage,
        'experience_level': experience_level,
        'experience_match': experience_match,
        'recommendations': recommendations,
        'keyword_density': min(100, max(50, match_score - 10)),  # Simplified calculation
        'resume_length': len(resume_text.split())
    }
    
    # Output result as JSON
    print(json.dumps(analysis_result))

if __name__ == '__main__':
    main()