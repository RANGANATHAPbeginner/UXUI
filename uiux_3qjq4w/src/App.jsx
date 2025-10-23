import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; 

// --- Configuration (from HTML script) ---
const BACKEND_CONFIG = {
    python: {
        name: 'Python Flask',
        baseUrl: 'http://localhost:5000',
        analyzeEndpoint: '/api/analyze',
    },
    nodejs: {
        name: 'Node.js Express',
        baseUrl: 'http://localhost:3000',
        analyzeEndpoint: '/api/analyze',
    }
};

// --- MAIN APP COMPONENT (Full UI Integration) ---
function App() {
    const [currentBackend, setCurrentBackend] = useState('nodejs');
    const [isServerConnected, setIsServerConnected] = useState(true);
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('We are looking for a skilled Frontend Developer with 3+ years of experience in React.js, JavaScript, and modern web development practices. The ideal candidate should have strong problem-solving skills, experience with responsive design, and familiarity with version control systems like Git. Knowledge of state management libraries (Redux, Context API) and testing frameworks (Jest, Cypress) is a plus.');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [apiResponseText, setApiResponseText] = useState('');
    
    // Multiple Resume State
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const selectedResume = resumes.find(r => r.id === selectedResumeId)?.analysis || results;
    
    const config = BACKEND_CONFIG[currentBackend];

    // --- UTILITY FUNCTIONS ---
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const updateScoreCircle = useCallback((score) => {
        const circle = document.getElementById('scoreCircle');
        if (circle) {
            circle.style.background = 'conic-gradient(var(--success) 0% ' + score + '%, var(--gray-light) ' + score + '% 100%)';
        }
    }, []);

    // --- CONNECTION & ANALYSIS LOGIC ---
    const testServerConnection = useCallback(async (backendKey = currentBackend) => {
        const testConfig = BACKEND_CONFIG[backendKey];
        
        setIsServerConnected(false);
        const statusTextElement = document.getElementById('statusText');
        const statusIndicatorElement = document.getElementById('statusIndicator');

        if (statusTextElement) statusTextElement.textContent = 'Checking connection...';
        if (statusIndicatorElement) statusIndicatorElement.classList.remove('connected');
        
        try {
            const response = await fetch(testConfig.baseUrl, { method: 'GET' });
            
            if (response.status === 200 || response.status === 404) {
                setIsServerConnected(true);
                if (statusIndicatorElement) statusIndicatorElement.classList.add('connected');
                if (statusTextElement) statusTextElement.textContent = 'Connected to ' + testConfig.name;
                return true;
            } else {
                throw new Error('Server returned ' + response.status);
            }
        } catch (error) {
            if (statusTextElement) statusTextElement.textContent = 'Connection failed: ' + error.message;
            if (backendKey === 'python') {
                console.error('Python Flask connection failed on startup. Using Node.js.'); 
            }
            return false;
        }
    }, [currentBackend]);

    const handleAnalyze = async () => {
        if (!isServerConnected) {
             alert('Please ensure the server is connected before analyzing.');
             return;
        }

        if (!file) {
            alert('Please upload a resume file.');
            return;
        }
        if (!jobDescription.trim()) {
            alert('Please provide a job description.');
            return;
            
        }

        setIsLoading(true);
        setApiResponseText('');

        try {
            const formData = new FormData();
            formData.append('resume', file, file.name); 
            formData.append('jobDescription', jobDescription); 

            const response = await fetch(config.baseUrl + config.analyzeEndpoint, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            setApiResponseText(JSON.stringify(result, null, 2));

            if (response.ok) {
                const newResumeId = Date.now();
                const newResume = {
                    id: newResumeId,
                    fileName: file.name,
                    analysis: result,
                };
                
                setResumes(prev => [...prev, newResume]);
                setSelectedResumeId(newResumeId);
                setResults(result); 
            } else {
                throw new Error(result.error || 'Analysis failed');
            }
        } catch (error) {
            alert('Error during analysis: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBackendSelect = (backendKey) => {
        setCurrentBackend(backendKey);
        if(backendKey === 'nodejs') setIsServerConnected(true); 
        else setIsServerConnected(false);
        testServerConnection(backendKey);
    };

    const handleFileChange = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
    };
    
    // Initial check and cleanup
    useEffect(() => {
        testServerConnection();
    }, [testServerConnection]);

    useEffect(() => {
        if(results) updateScoreCircle(results.match_score || 0);
    }, [results, updateScoreCircle]);

    // --- RENDER HELPERS ---
    const renderAnalysisDetails = (data) => {
        const analysisData = data || { match_score: 0, experience_match: '-', skills_match_percentage: '-', keyword_density: '-', backendUsed: '-', skills_found: [], recommendations: [] };

        const allTechnicalSkills = ['javascript', 'python', 'java', 'react', 'node.js', 'html', 'css', 
                                  'sql', 'mongodb', 'git', 'aws', 'docker', 'kubernetes'];
        const foundSkillNames = analysisData.skills_found.filter(s => s.category === 'technical').map(s => s.name);
        const missingSkillNames = allTechnicalSkills.filter(skill => !foundSkillNames.includes(skill));

        return (
            <>
                <div className="card">
                    <div className="card-header"><h2 className="card-title">Analysis Results</h2><i className="fas fa-chart-bar" style={{color: 'var(--success)'}}></i></div>
                    <div className="score-container">
                        <div className="score-circle" id="scoreCircle">
                            <div className="score-inner">
                                <div className="score-value">{analysisData.match_score || 0}%</div>
                                <div className="score-label">MATCH</div>
                            </div>
                        </div>
                    </div>
                    <div className="analysis-details">
                        <div className="detail-item"><span className="detail-name">Experience Match</span><span className="detail-value" id="experienceMatch">{analysisData.experience_match || '-'}</span></div>
                        <div className="detail-item"><span className="detail-name">Skills Match</span><span className="detail-value" id="skillsMatch">{analysisData.skills_match_percentage ? analysisData.skills_match_percentage + '%' : '-'}</span></div>
                        <div className="detail-item"><span className="detail-name">Education Match</span><span className="detail-value" id="educationMatch">-</span></div>
                        <div className="detail-item"><span className="detail-name">Keyword Density</span><span className="detail-value" id="keywordDensity">{analysisData.keyword_density ? analysisData.keyword_density + '%' : '-'}</span></div>
                        <div className="detail-item"><span className="detail-name">Backend Used</span><span className="detail-value" id="backendUsed">{analysisData.backendUsed || (selectedResume ? config.name : '-')}</span></div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header"><h2 className="card-title">Skills Analysis</h2><i className="fas fa-tools" style={{color: 'var(--warning)'}}></i></div>
                    <h3 style={{marginBottom: '10px'}}>Matched Skills</h3>
                    <div className="skills-container" id="matchedSkills">
                        {foundSkillNames.length > 0 ? foundSkillNames.map(s => <div key={s} className="skill-tag">{s}</div>) : <div className="skill-tag">No technical skills found</div>}
                    </div>
                    <h3 style={{margin: '20px 0 10px'}}>Missing Skills</h3>
                    <div className="skills-container" id="missingSkills">
                        {missingSkillNames.length > 0 ? missingSkillNames.map(s => <div key={s} className="skill-tag missing">{s}</div>) : <div className="skill-tag missing">All key skills found!</div>}
                    </div>
                </div>
                
                <div className="card">
                    <div className="card-header"><h2 className="card-title">AI Recommendations</h2><i className="fas fa-robot" style={{color: 'var(--primary)'}}></i></div>
                    <div id="recommendationsList">
                        {analysisData.recommendations && analysisData.recommendations.length > 0 ? (
                            analysisData.recommendations.map((rec, index) => (
                                <div key={index} className="recommendation-item">
                                    <div className="rec-title">{rec.title}</div>
                                    <p>{rec.description}</p>
                                </div>
                            ))
                        ) : (
                            <div className="recommendation-item">
                                <div className="rec-title">Upload your resume to get started</div>
                                <p>Please upload your resume and provide a job description to receive personalized AI recommendations.</p>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    };

    // --- MAIN RENDER ---
    return (
        <>
            <header>
                <div className="container">
                    <div className="header-content">
                        <div className="logo"><i className="fas fa-file-alt"></i><span>ResumeAI</span></div>
                        <nav><ul><li><a href="#"><i className="fas fa-home"></i> Home</a></li><li><a href="#"><i className="fas fa-history"></i> History</a></li><li><a href="#"><i className="fas fa-cog"></i> Settings</a></li><li><a href="#"><i className="fas fa-question-circle"></i> Help</a></li></ul></nav>
                    </div>
                </div>
            </header>

            <div className="container">
                {/* Configuration Panel */}
                <div className="config-panel">
                    <div className="config-title">Backend Configuration</div>
                    <div className="backend-selector">
                        {Object.keys(BACKEND_CONFIG).map(key => (
                            <div 
                                key={key}
                                className={'backend-option ' + (currentBackend === key ? 'active' : '')} 
                                data-backend={key}
                                onClick={() => handleBackendSelect(key)}
                            >
                                <i className={'fab fa-' + (key === 'python' ? 'python' : 'node-js')}></i>
                                <span>{BACKEND_CONFIG[key].name} ({BACKEND_CONFIG[key].baseUrl.split(':').pop()})</span>
                            </div>
                        ))}
                        <div className="server-status">
                            <div className={'status-indicator ' + (isServerConnected ? 'connected' : '')} id="statusIndicator"></div>
                            <span id="statusText">Checking connection...</span>
                        </div>
                        <button className="btn btn-success" id="testConnection" onClick={() => testServerConnection()}>
                            <i className="fas fa-plug"></i> Test Connection
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {/* Left Column: Input Section */}
                    <div className="left-column">
                        <div className="card">
                            <div className="card-header"><h2 className="card-title">Upload Resume(s)</h2><i className="fas fa-file-pdf" style={{color: 'var(--primary)'}}></i></div>
                            <form id="uploadForm" encType="multipart/form-data">
                                <div className="upload-area" id="uploadArea">
                                    <i className="fas fa-cloud-upload-alt"></i>
                                    <h3 className="upload-text">Drag & Drop your resume here</h3>
                                    <p>Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)</p>
                                    <input type="file" id="resumeFile" name="resume" accept=".pdf,.doc,.docx,.txt" style={{display: 'none'}} onChange={handleFileChange} />
                                    <button type="button" className="btn btn-secondary" style={{marginTop: '15px'}} onClick={() => document.getElementById('resumeFile').click()} disabled={isLoading}>
                                        <i className="fas fa-folder-open"></i> Browse Files
                                    </button>
                                </div>
                                {file && (
                                    <div className="file-info" id="fileInfo">
                                        <i className="fas fa-file-pdf" style={{color: 'var(--danger)'}}></i>
                                        <div>
                                            <div id="fileName">{file.name}</div>
                                            <div id="fileSize" style={{fontSize: '0.9rem', color: 'var(--gray)'}}>{formatFileSize(file.size)}</div>
                                        </div>
                                        <button type="button" className="btn btn-outline" style={{marginLeft: 'auto'}} onClick={handleRemoveFile}>
                                            <i className="fas fa-times"></i> Remove
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                        <div className="card">
                            <div className="card-header"><h2 className="card-title">Job Description</h2><i className="fas fa-briefcase" style={{color: 'var(--secondary)'}}></i></div>
                            <div className="job-description">
                                <textarea id="jobDescription" placeholder="Paste the job description here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} disabled={isLoading}></textarea>
                            </div>
                            <div style={{marginTop: '15px', display: 'flex', gap: '10px'}}>
                                <button className="btn" id="analyzeBtn" type="button" onClick={handleAnalyze} disabled={isLoading || !file}>
                                    <i className="fas fa-chart-line"></i> {isLoading ? 'Analyzing...' : 'Analyze Resume'}
                                </button>
                                <button className="btn btn-outline" type="button" onClick={() => {setFile(null); setJobDescription(''); setResults(null); setResumes([]); setSelectedResumeId(null);}} disabled={isLoading}>
                                    <i className="fas fa-redo"></i> Reset
                                </button>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="loading" id="loadingIndicator" style={{display: 'block'}}>
                                <div className="spinner"></div>
                                <p>Analyzing your resume with AI...</p>
                                <p style={{fontSize: '0.9rem', color: 'var(--gray)'}}>This may take a few seconds</p>
                            </div>
                        )}
                        <div className="api-response" id="apiResponse" style={{display: apiResponseText ? 'block' : 'none'}}>
                            <strong>API Response:</strong>
                            <pre id="responseContent">{apiResponseText}</pre>
                        </div>

                        {/* Analysis Queue Panel (Added to left column for two-column structure) */}
                        <div className="card" style={{marginTop: '20px'}}>
                            <div className="card-header"><h2 className="card-title">Analysis Queue ({resumes.length})</h2><i className="fas fa-list-alt" style={{color: 'var(--warning)'}}></i></div>
                            {resumes.length > 0 ? (
                                resumes.map(resume => (
                                    <div
                                        key={resume.id}
                                        className={'resume-item ' + (resume.id === selectedResumeId ? 'selected' : '')}
                                        onClick={() => {setResults(resume.analysis); setSelectedResumeId(resume.id); updateScoreCircle(resume.analysis.match_score || 0);}}
                                        style={{display: 'flex', justifyContent: 'space-between', padding: '10px', marginBottom: '8px', background: 'var(--gray-light)', borderRadius: '4px', cursor: 'pointer', borderLeft: resume.id === selectedResumeId ? '5px solid var(--primary)' : '5px solid transparent'}}
                                    >
                                        <span>{resume.fileName}</span>
                                        <span style={{fontWeight: 'bold', color: 'var(--success)'}}>{resume.analysis.match_score}%</span>
                                    </div>
                                ))
                            ) : (
                                <p style={{color: 'var(--gray)'}}>No resumes in queue. Upload one to start analysis.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Results Section */}
                    <div className="right-column">
                        {renderAnalysisDetails(selectedResume)}
                    </div>
                </div>
            </div>

            <footer><div className="container"><div className="footer-content"><div className="footer-section"><h3>ResumeAI</h3><p>Leveraging artificial intelligence to help job seekers optimize their resumes and improve their chances of landing interviews.</p></div><div className="footer-section"><h3>Quick Links</h3><ul className="footer-links"><li><a href="#">Home</a></li><li><a href="#">How It Works</a></li><li><a href="#">Pricing</a></li><li><a href="#">Blog</a></li></ul></div><div className="footer-section"><h3>Legal</h3><ul className="footer-links"><li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Service</a></li><li><a href="#">Data Security</a></li></ul></div><div className="footer-section"><h3>Contact Us</h3><ul className="footer-links"><li><a href="#"><i className="fas fa-envelope"></i> support@resumeai.com</a></li><li><a href="#"><i className="fas fa-phone"></i> +1 (555) 123-4567</a></li><li><a href="#"><i className="fas fa-map-marker-alt"></i> San Francisco, CA</a></li></ul></div></div><div className="copyright"><p>&copy; 2023 ResumeAI. All rights reserved.</p></div></div></footer>
        </>
    );
}

export default App;
