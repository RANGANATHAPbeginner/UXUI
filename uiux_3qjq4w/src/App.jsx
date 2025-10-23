import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import './App.css'; 

// --- Configuration ---
const BACKEND_CONFIG = {
    nodejs: { name: 'Node.js Express', baseUrl: 'http://localhost:3000', analyzeEndpoint: '/api/analyze' }
};

// --- RENDER ANALYSIS DETAILS HELPER FUNCTION ---
const renderAnalysisDetails = (data) => {
    const analysisData = data || { match_score: 0, experience_match: '-', skills_match_percentage: '-', keyword_density: '-', skills_found: [], recommendations: [] };
    const allTechnicalSkills = ['javascript', 'python', 'java', 'react', 'node.js', 'html', 'css', 'sql', 'mongodb', 'git', 'aws', 'docker', 'kubernetes'];
    const foundSkillNames = (analysisData.skills_found || []).filter(s => s.category === 'technical').map(s => s.name);
    const missingSkillNames = allTechnicalSkills.filter(skill => !foundSkillNames.includes(skill));

    return (
        <>
            <div className='card'>
                <div className='card-header'><h2 className='card-title'>Analysis Results</h2></div>
                <div className='score-container'><div className='score-circle' id='scoreCircle'><div className='score-inner'><div id='scoreValue' className='score-value'>0%</div><div className='score-label'>MATCH</div></div></div></div>
                <div className='analysis-details'>
                    <div className='detail-item'><span>Experience Match</span><span>{analysisData.experience_match || '-'}</span></div>
                    <div className='detail-item'><span>Skills Match</span><span>{analysisData.skills_match_percentage ? analysisData.skills_match_percentage + '%' : '-'}</span></div>
                    <div className='detail-item'><span>Keyword Density</span><span>{analysisData.keyword_density ? analysisData.keyword_density + '%' : '-'}</span></div>
                </div>
            </div>
            <div className='card'>
                <div className='card-header'><h2 className='card-title'>Skills Analysis</h2></div>
                <h3>Matched Skills</h3>
                <div className='skills-container'>{foundSkillNames.length > 0 ? foundSkillNames.map(s => <div key={s} className='skill-tag'>{s}</div>) : <p>No matched skills</p>}</div>
                <h3 style={{marginTop: '20px'}}>Missing Skills</h3>
                <div className='skills-container'>{missingSkillNames.length > 0 ? missingSkillNames.map(s => <div key={s} className='skill-tag missing'>{s}</div>) : <p>All key skills found!</p>}</div>
            </div>
            <div className='card'>
                <div className='card-header'><h2 className='card-title'>AI Recommendations</h2></div>
                {(analysisData.recommendations || []).length > 0 ? analysisData.recommendations.map((rec, i) => <div key={i} className='recommendation-item'><h4>{rec.title}</h4><p>{rec.description}</p></div>) : <p>No recommendations. Looks good!</p>}
            </div>
        </>
    );
};

// --- PAGE COMPONENTS ---
const HomePage = ({ logic }) => {
    const { files, jobDescription, setJobDescription, isLoading, handleAnalyze, handleDragOver, handleDrop, handleFileChange, handleRemoveFile, resumes, selectedResumeId, displayedAnalysis, formatFileSize, setSelectedResumeId } = logic;
    return (
        <div className='main-content'>
            <div className='left-column'>
                <div className='card'>
                    <div className='card-header'><h2 className='card-title'>Upload Resume(s)</h2></div>
                    <div className='upload-area' onDragOver={handleDragOver} onDrop={handleDrop}>
                        <h3>Drag & Drop Resumes</h3><p>or</p>
                        <input type='file' id='resumeFile' style={{display: 'none'}} onChange={handleFileChange} multiple />
                        <button type='button' className='btn btn-secondary' style={{marginTop: '15px'}} onClick={() => document.getElementById('resumeFile').click()} disabled={isLoading}>Browse Files</button>
                    </div>
                    {files.map(file => (<div key={file.name} className='file-info'><span>{file.name} ({formatFileSize(file.size)})</span><button className='btn-outline' onClick={() => handleRemoveFile(file.name)}>Remove</button></div>))}
                </div>
                <div className='card'>
                    <div className='card-header'><h2 className='card-title'>Job Description</h2></div>
                    <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} disabled={isLoading}></textarea>
                    <div style={{marginTop: '15px', display: 'flex', gap: '10px'}}>
                        <button className='btn' onClick={handleAnalyze} disabled={isLoading || files.length === 0}>{isLoading ? 'Analyzing...' : 'Analyze ' + files.length + ' Resume(s)'}</button>
                        <button className='btn btn-outline' type='button' onClick={() => { logic.setFiles([]); logic.setJobDescription(''); logic.setResults(null); logic.setResumes([]); logic.setSelectedResumeId(null);}}>Reset</button>
                    </div>
                </div>
                {resumes.length > 0 && <div className='card'>
                    <div className='card-header'><h2 className='card-title'>Analysis History ({resumes.length})</h2></div>
                    {resumes.map(r => <div key={r.id} className={'resume-item ' + (r.id === selectedResumeId ? 'selected' : '')} onClick={() => setSelectedResumeId(r.id)}><span>{r.fileName}</span><span style={{fontWeight: 'bold', color: 'var(--success)'}}>{r.analysis.match_score}%</span></div>)}
                </div>}
            </div>
            <div className='right-column'>{renderAnalysisDetails(displayedAnalysis)}</div>
        </div>
    );
};
const HistoryPage = ({ resumes, setSelectedResumeId, setResults }) => {
    const navigate = useNavigate();
    return (
    <div className='page-content'><div className='card' style={{width: '100%'}}><h2>Full Analysis History ({resumes.length})</h2>{resumes.map(r => (<div key={r.id} className='resume-item' onClick={() => { setSelectedResumeId(r.id); setResults(r.analysis); navigate('/'); }}><span style={{cursor: 'pointer'}}>{r.fileName} - Match: {r.analysis.match_score}%</span><span style={{fontSize: '0.8rem', color: 'var(--gray)'}}>{new Date(r.id).toLocaleString()}</span></div>))}</div></div>
)};
const SettingsPage = ({ theme, setTheme }) => (
    <div className='page-content'><div className='card' style={{width: '100%'}}><h2>Settings</h2><label className='switch-label'><span>Dark Mode (Neon Sci-Fi)</span><div><input type='checkbox' checked={theme === 'dark'} onChange={() => setTheme(theme === 'light' ? 'dark' : 'light')} /><span className='slider round'></span></div></label></div></div>
);
const HelpPage = () => (<div className='page-content'><div className='card' style={{width: '100%'}}><h2>Help & Support</h2><p>Developed by Maneeth Rao and Ranganatha P. | Phone: **********</p></div></div>);


// --- MAIN APP COMPONENT ---
function App() {
    const [theme, setTheme] = useState('light');
    const [files, setFiles] = useState([]);
    const [jobDescription, setJobDescription] = useState('React.js developer with 3+ years of experience in JavaScript.');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const displayedAnalysis = resumes.find(r => r.id === selectedResumeId)?.analysis || results;

    useEffect(() => { document.body.className = theme === 'dark' ? 'dark-mode' : ''; }, [theme]);
    
    const formatFileSize = (bytes) => (bytes / 1024).toFixed(2) + ' KB';
    const handleFilesReceived = useCallback((fileList) => setFiles(prev => [...prev, ...Array.from(fileList)]), []);
    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => { e.preventDefault(); handleFilesReceived(e.dataTransfer.files); };
    const handleFileChange = (e) => handleFilesReceived(e.target.files);
    const handleRemoveFile = (fileName) => setFiles(prev => prev.filter(f => f.name !== fileName));
    const updateScoreCircle = useCallback((score) => {
        const circle = document.getElementById('scoreCircle');
        if (circle) {
            const safeScore = score || 0;
            circle.style.background = 'conic-gradient(var(--success) 0% ' + safeScore + '%, var(--gray-light) ' + safeScore + '% 100%)';
            const scoreValueEl = document.getElementById('scoreValue');
            if (scoreValueEl) scoreValueEl.textContent = safeScore + '%';
        }
    }, []);

    useEffect(() => { if(displayedAnalysis) updateScoreCircle(displayedAnalysis.match_score); }, [displayedAnalysis, updateScoreCircle]);

    const handleAnalyze = async () => {
        if (files.length === 0 || !jobDescription.trim()) return alert('Please provide files and a job description.');
        setIsLoading(true);
        const newResumes = [];
        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('resume', file);
                formData.append('jobDescription', jobDescription);
                const response = await fetch(BACKEND_CONFIG.nodejs.baseUrl + BACKEND_CONFIG.nodejs.analyzeEndpoint, { method: 'POST', body: formData });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                const newEntry = { id: Date.now() + Math.random(), fileName: file.name, analysis: {...result, backendUsedKey: 'nodejs'} };
                newResumes.push(newEntry);
            } catch (error) { alert('Analysis failed for ' + file.name + ': ' + error.message); }
        }
        if (newResumes.length > 0) {
            setResumes(prev => [...prev, ...newResumes]);
            const lastResult = newResumes[newResumes.length - 1];
            setSelectedResumeId(lastResult.id);
            setResults(lastResult.analysis);
        }
        setIsLoading(false);
        setFiles([]);
    };
    
    const logicProps = { files, jobDescription, setJobDescription, isLoading, handleAnalyze, handleDragOver, handleDrop, handleFileChange, handleRemoveFile, resumes, selectedResumeId, displayedAnalysis, formatFileSize, updateScoreCircle, setSelectedResumeId, renderAnalysisDetails };

    return (
        <div className={'App ' + theme}>
            <header>
                <div className='container'>
                    <div className='header-content'>
                        <div className='logo'><i className='fas fa-file-alt'></i><span>ResumeAI</span></div>
                        <nav><ul><li><NavLink to='/' className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink></li><li><NavLink to='/history' className={({isActive}) => isActive ? 'active' : ''}>History</NavLink></li><li><NavLink to='/settings' className={({isActive}) => isActive ? 'active' : ''}>Settings</NavLink></li><li><NavLink to='/help' className={({isActive}) => isActive ? 'active' : ''}>Help</NavLink></li></ul></nav>
                    </div>
                </div>
            </header>
            <div className='container'>
                <Routes>
                    <Route path='/' element={<HomePage logic={logicProps} />} />
                    <Route path='/history' element={<HistoryPage resumes={resumes} setSelectedResumeId={setSelectedResumeId} setResults={setResults} />} />
                    <Route path='/settings' element={<SettingsPage theme={theme} setTheme={setTheme} />} />
                    <Route path='/help' element={<HelpPage />} />
                </Routes>
            </div>
            <footer><div className='container'><div className='copyright'><p>&copy; {new Date().getFullYear()} ResumeAI Project | Developers: Maneeth Rao, Ranganatha P.</p></div></div></footer>
        </div>
    );
}

// Main Export
function AppWrapper() {
    return (
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
}
export default AppWrapper;
