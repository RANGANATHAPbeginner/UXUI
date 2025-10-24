import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import './App.css'; 

// Import page components
import HistoryPage from './History';
import SettingsPage from './Settings';
import HelpPage from './Help';

// --- Configuration ---
const BACKEND_CONFIG = {
    nodejs: { name: 'Node.js Express', baseUrl: 'http://localhost:3000', analyzeEndpoint: '/api/analyze' }
};

// --- RENDER ANALYSIS DETAILS HELPER FUNCTION ---
const renderAnalysisDetails = (data) => {
    const analysisData = data || { match_score: 0, experience_match: '-', skills_match_percentage: '-', skills_found: [], recommendations: [] };
    const allTechSkills = ['javascript', 'python', 'java', 'react', 'node.js', 'html', 'css', 'sql', 'mongodb', 'git', 'aws', 'docker', 'kubernetes'];
    const foundSkills = (analysisData.skills_found || []).filter(s => s.category === 'technical').map(s => s.name);
    const missingSkills = allTechSkills.filter(s => !foundSkills.includes(s));

    return (
        <>
            <div className='card'>
                <div className='card-header'><h2 className='card-title'>Analysis Results</h2></div>
                <div className='score-container'><div className='score-circle' id='scoreCircle'><div className='score-inner'><div id='scoreValue' className='score-value'>0%</div><div className='score-label'>MATCH</div></div></div></div>
                <div className='analysis-details'>
                    <div className='detail-item'><span>Experience Match</span><span>{analysisData.experience_match || '-'}</span></div>
                    <div className='detail-item'><span>Skills Match</span><span>{analysisData.skills_match_percentage ? (analysisData.skills_match_percentage + '%') : '-'}</span></div>
                </div>
            </div>
            <div className='card'><div className='card-header'><h2 className='card-title'>Skills Analysis</h2></div><h3>Matched Skills</h3><div className='skills-container'>{foundSkills.length > 0 ? foundSkills.map(s => <div key={s} className='skill-tag'>{s}</div>) : <p>No matched skills found.</p>}</div><h3 style={{marginTop: '20px'}}>Missing Skills</h3><div className='skills-container'>{missingSkills.length > 0 ? missingSkills.map(s => <div key={s} className='skill-tag missing'>{s}</div>) : <p>All key skills found!</p>}</div></div>
            <div className='card'><div className='card-header'><h2 className='card-title'>AI Recommendations</h2></div>{(analysisData.recommendations || []).length > 0 ? analysisData.recommendations.map((rec, i) => <div key={i} className='recommendation-item'><h4>{rec.title}</h4><p>{rec.description}</p></div>) : <p>No recommendations. Looks good!</p>}</div>
        </>
    );
};

// --- HOME PAGE COMPONENT ---
const HomePage = ({ logic }) => {
    // FIX 1: Added 'setResults' to destructuring to prevent crash on Reset
    const { files, jobDescription, setJobDescription, isLoading, handleAnalyze, handleDragOver, handleDrop, handleFileChange, handleRemoveFile, resumes, selectedResumeId, displayedAnalysis, formatFileSize, setSelectedResumeId, reportGenerated, setReportGenerated, setResults } = logic;
    const rankedResumes = [...resumes].sort((a,b) => b.analysis.match_score - a.analysis.match_score);
    return (
        <div className='main-content'>
            <div className='left-column'>
                <div className='card'><div className='card-header'><h2 className='card-title'>Upload Resume(s)</h2></div><div className='upload-area' onDragOver={handleDragOver} onDrop={handleDrop}><h3>Drag & Drop Resumes</h3><p>or</p><input type='file' id='resumeFile' style={{display: 'none'}} onChange={handleFileChange} multiple /><button type='button' className='btn btn-secondary' style={{marginTop: '15px'}} onClick={() => document.getElementById('resumeFile').click()} disabled={isLoading}>Browse Files</button></div>{files.map(file => (<div key={file.name} className='file-info'><span>{file.name} ({formatFileSize(file.size)})</span><button className='btn-outline' onClick={() => handleRemoveFile(file.name)}>Remove</button></div>))}</div>
                <div className='card'><div className='card-header'><h2 className='card-title'>Job Description</h2></div><textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} disabled={isLoading}></textarea><div style={{marginTop: '15px', display: 'flex', gap: '10px'}}><button className='btn' onClick={handleAnalyze} disabled={isLoading || files.length === 0}>{isLoading ? 'Analyzing...' : 'Analyze ' + files.length + ' Resume(s)'}</button><button className='btn btn-outline' onClick={() => { logic.setFiles([]); logic.setJobDescription(''); logic.setResults(null); logic.setResumes([]); logic.setSelectedResumeId(null); setReportGenerated(false); }}>Reset</button></div></div>
                
                {/* --- FIXES APPLIED IN THIS BLOCK --- */}
                {reportGenerated && <div className='card ranking-block'><div className='card-header'><h2 className='card-title'>Analysis Ranking Report</h2></div>{rankedResumes.map((resume, index) => (
                    <div 
                        key={resume.id} 
                        className='rank-item'
                        // FIX 2: Added onClick handler to make list items selectable
                        onClick={() => setSelectedResumeId(resume.id)} 
                    >
                        {/* FIX 3: Corrected invalid className syntax */}
                        <div className='rank-position'>{index + 1}</div>
                        <div className='rank-details'>
                            <div>{resume.fileName}</div>
                            <div className='rank-score'>{resume.analysis.match_score}% Match</div>
                        </div>
                    </div>
                ))}</div>}
            </div>
            <div className='right-column'>{renderAnalysisDetails(displayedAnalysis)}</div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
function App() {
    const [theme, setTheme] = useState('light');
    const [files, setFiles] = useState([]);
    const [jobDescription, setJobDescription] = useState('React.js developer with 3+ years of experience in JavaScript.');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [reportGenerated, setReportGenerated] = useState(false);
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
        setReportGenerated(false);
        const newResumes = [];
        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('resume', file);
                formData.append('jobDescription', jobDescription);
                const response = await fetch(BACKEND_CONFIG.nodejs.baseUrl + BACKEND_CONFIG.nodejs.analyzeEndpoint, { method: 'POST', body: formData });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                newResumes.push({ id: Date.now() + Math.random(), fileName: file.name, analysis: result });
            } catch (error) { alert('Analysis failed for ' + file.name + ': ' + error.message); }
        }
        if (newResumes.length > 0) {
            setResumes(prev => [...prev, ...newResumes]);
            const lastResult = newResumes[newResumes.length - 1];
            setSelectedResumeId(lastResult.id);
            setResults(lastResult.analysis);
            setReportGenerated(true);
        }
        setIsLoading(false);
        setFiles([]);
    };
    
    // FIX 4: Added 'setResults' to logicProps to prevent crash on Reset
    const logicProps = { files, setFiles, jobDescription, setJobDescription, isLoading, handleAnalyze, handleDragOver, handleDrop, handleFileChange, handleRemoveFile, resumes, selectedResumeId, displayedAnalysis, formatFileSize, updateScoreCircle, setSelectedResumeId, reportGenerated, setReportGenerated, setResults };

    return (
        <div className={'App-wrapper ' + theme}>
            <header>
                <div className='container'><div className='header-content'><div className='logo'><span>ResumeAI</span></div><nav><ul><li><NavLink to='/' className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink></li><li><NavLink to='/history' className={({isActive}) => isActive ? 'active' : ''}>History</NavLink></li><li><NavLink to='/settings' className={({isActive}) => isActive ? 'active' : ''}>Settings</NavLink></li><li><NavLink to='/help' className={({isActive}) => isActive ? 'active' : ''}>Help</NavLink></li></ul></nav></div></div>
            </header>
            <main className='content-wrap'><div className='container'>
                <Routes>
                    <Route path='/' element={<HomePage logic={logicProps} />} />
                    <Route path='/history' element={<HistoryPage resumes={resumes} setSelectedResumeId={setSelectedResumeId} setResults={setResults} />} />
                    <Route path='/settings' element={<SettingsPage theme={theme} setTheme={setTheme} />} />
                    <Route path='/help' element={<HelpPage />} />
                </Routes>
            </div></main>
            <footer><div className='container'><div className='copyright'><p>&copy; {new Date().getFullYear()} ResumeAI Project | Developers: Maneeth Rao, Ranganatha P.</p></div></div></footer>
        </div>
    );
}

function AppWrapper() {
    return (<BrowserRouter><App /></BrowserRouter>);
}
export default AppWrapper;