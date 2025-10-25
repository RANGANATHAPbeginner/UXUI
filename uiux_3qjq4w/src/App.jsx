import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './App.css'; 

import { supabase } from './supabaseClient';
import AuthPage from './Login';
import HistoryPage from './History';
import SettingsPage from './Settings';
import HelpPage from './Help';
import AnalysisChart from './AnalysisChart'; // NEW: Import the chart component

const BACKEND_CONFIG = {
    nodejs: { name: 'Node.js Express', baseUrl: 'http://localhost:3000', analyzeEndpoint: '/api/analyze' }
};

const renderAnalysisDetails = (data) => {
    // ... (This function remains unchanged)
    const analysisData = data || { match_score: 0, experience_match: '-', skills_match_percentage: '-', skills_found: [], recommendations: [] };
    const allTechSkills = ['javascript', 'python', 'java', 'react', 'node.js', 'html', 'css', 'sql', 'mongodb', 'git', 'aws', 'docker', 'kubernetes'];
    const foundSkills = (analysisData.skills_found || []).filter(s => s.category === 'technical').map(s => s.name);
    const missingSkills = allTechSkills.filter(s => !foundSkills.includes(s));
    return (
        <>
            <div className='card'><div className='card-header'><h2 className='card-title'>Analysis Results</h2></div><div className='score-container'><div className='score-circle' id='scoreCircle'><div className='score-inner'><div id='scoreValue' className='score-value'>0%</div><div className='score-label'>MATCH</div></div></div></div><div className='analysis-details'><div className='detail-item'><span>Experience Match</span><span>{analysisData.experience_match || '-'}</span></div><div className='detail-item'><span>Skills Match</span><span>{analysisData.skills_match_percentage ? (analysisData.skills_match_percentage + '%') : '-'}</span></div></div></div>
            <div className='card'><div className='card-header'><h2 className='card-title'>Skills Analysis</h2></div><h3>Matched Skills</h3><div className='skills-container'>{foundSkills.length > 0 ? foundSkills.map(s => <div key={s} className='skill-tag'>{s}</div>) : <p>No matched skills found.</p>}</div><h3 style={{marginTop: '20px'}}>Missing Skills</h3><div className='skills-container'>{missingSkills.length > 0 ? missingSkills.map(s => <div key={s} className='skill-tag missing'>{s}</div>) : <p>All key skills found!</p>}</div></div>
            <div className='card'><div className='card-header'><h2 className='card-title'>AI Recommendations</h2></div>{(analysisData.recommendations || []).length > 0 ? analysisData.recommendations.map((rec, i) => <div key={i} className='recommendation-item'><h4>{rec.title}</h4><p>{rec.description}</p></div>) : <p>No recommendations. Looks good!</p>}</div>
        </>
    );
};

const HomePage = ({ logic }) => {
    // NEW: Destructure new props for upload mode and filtering
    const { 
        files, jobDescription, setJobDescription, isLoading, handleAnalyze, handleDragOver, handleDrop, 
        handleFileChange, handleRemoveFile, displayedResumes, selectedResumeId, displayedAnalysis, 
        formatFileSize, setSelectedResumeId, reportGenerated, setReportGenerated, setResults,
        uploadMode, setUploadMode, filterRange, setFilterRange, resumes 
    } = logic;

    return (
        <div className='main-content'>
            <div className='left-column'>
                {/* NEW: Upload Mode Toggle */}
                <div className='card'>
                    <div className='card-header'>
                        <div className='toggle-buttons'>
                            <button onClick={() => setUploadMode('single')} className={uploadMode === 'single' ? 'active' : ''}>Single Resume</button>
                            <button onClick={() => setUploadMode('multiple')} className={uploadMode === 'multiple' ? 'active' : ''}>Multiple Resumes</button>
                        </div>
                    </div>

                    {/* Single Upload UI */}
                    {uploadMode === 'single' && (
                        <div className='upload-area' onDragOver={handleDragOver} onDrop={handleDrop}>
                            <h3>Drag & Drop a Resume</h3><p>or</p>
                            <input type='file' id='resumeFileSingle' style={{display: 'none'}} onChange={handleFileChange} />
                            <button type='button' className='btn btn-secondary' onClick={() => document.getElementById('resumeFileSingle').click()} disabled={isLoading}>Browse File</button>
                        </div>
                    )}

                    {/* Multiple Upload UI */}
                    {uploadMode === 'multiple' && (
                        <div className='upload-area' onDragOver={handleDragOver} onDrop={handleDrop}>
                            <h3>Drag & Drop Resumes</h3><p>or</p>
                            <input type='file' id='resumeFileMultiple' style={{display: 'none'}} onChange={handleFileChange} multiple />
                            <button type='button' className='btn btn-secondary' onClick={() => document.getElementById('resumeFileMultiple').click()} disabled={isLoading}>
                                + ADD
                            </button>
                        </div>
                    )}
                    {files.map(file => (<div key={file.name} className='file-info'><span>{file.name} ({formatFileSize(file.size)})</span><button className='btn-outline' onClick={() => handleRemoveFile(file.name)}>Remove</button></div>))}
                </div>

                <div className='card'><div className='card-header'><h2 className='card-title'>Job Description</h2></div><textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} disabled={isLoading}></textarea><div style={{marginTop: '15px', display: 'flex', gap: '10px'}}><button className='btn' onClick={handleAnalyze} disabled={isLoading || files.length === 0}>{isLoading ? 'Analyzing...' : 'Analyze ' + files.length + ' Resume(s)'}</button><button className='btn btn-outline' onClick={() => { logic.setFiles([]); logic.setJobDescription(''); logic.setResults(null); logic.setResumes([]); logic.setSelectedResumeId(null); setReportGenerated(false); setFilterRange(null); }}>Reset</button></div></div>
                
                {/* NEW: Show Chart for multiple resumes */}
                {reportGenerated && uploadMode === 'multiple' && resumes.length > 0 && (
                    <div className='card'>
                        <div className='card-header'><h2 className='card-title'>Score Distribution</h2></div>
                        <AnalysisChart resumes={resumes} onBarClick={(range) => setFilterRange(range)} />
                        {filterRange && <button className='btn-outline' style={{marginTop: '10px'}} onClick={() => setFilterRange(null)}>Clear Filter</button>}
                    </div>
                )}
                
                {reportGenerated && (
                    <div className='card ranking-block'>
                        <div className='card-header'><h2 className='card-title'>Analysis Ranking Report</h2></div>
                        {/* MODIFIED: Use the new displayedResumes list */}
                        {displayedResumes.map((resume, index) => (
                            <div key={resume.id} className='rank-item' onClick={() => setSelectedResumeId(resume.id)}>
                                <div className='rank-position'>{index + 1}</div>
                                <div className='rank-details'>
                                    <div>{resume.fileName}</div>
                                    <div className='rank-score'>{resume.analysis.match_score}% Match</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className='right-column'>{renderAnalysisDetails(displayedAnalysis)}</div>
        </div>
    );
};

function App() {
    const [session, setSession] = useState(null);
    const [theme, setTheme] = useState('light');
    const [files, setFiles] = useState([]);
    const [jobDescription, setJobDescription] = useState('React.js developer...');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [reportGenerated, setReportGenerated] = useState(false);
    
    // NEW STATE: For upload mode and chart filtering
    const [uploadMode, setUploadMode] = useState('single');
    const [filterRange, setFilterRange] = useState(null);

    const displayedAnalysis = resumes.find(r => r.id === selectedResumeId)?.analysis || results;
    
    // NEW LOGIC: Create a sorted/filtered list of resumes for display
    const displayedResumes = useMemo(() => {
        const sortedResumes = [...resumes].sort((a, b) => b.analysis.match_score - a.analysis.match_score);
        if (!filterRange) {
            return sortedResumes;
        }
        const inRange = sortedResumes.filter(r => r.analysis.match_score >= filterRange.min && r.analysis.match_score <= filterRange.max);
        const outOfRange = sortedResumes.filter(r => r.analysis.match_score < filterRange.min || r.analysis.match_score > filterRange.max);
        return [...inRange, ...outOfRange];
    }, [resumes, filterRange]);

    const fetchUserHistory = async (user) => { 
        try {
            const { data, error } = await supabase
                .from('analyses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (data) {
                const userResumes = data.map(item => ({
                    id: item.id,
                    fileName: item.file_name,
                    analysis: item.analysis_data,
                    createdAt: item.created_at
                }));
                setResumes(userResumes);
            }
        } catch (error) {
            console.error('Error fetching user history:', error);
        }
    };

    // PROPER SESSION HANDLING
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchUserHistory(session.user);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchUserHistory(session.user);
            } else {
                setResumes([]);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => { 
        document.body.className = theme === 'dark' ? 'dark-mode' : ''; 
    }, [theme]);
    
    const formatFileSize = (bytes) => (bytes / 1024).toFixed(2) + ' KB';
    
    // MODIFIED: Ensure new files are added to the list, not replacing it
    const handleFilesReceived = useCallback((fileList) => {
        const newFiles = Array.from(fileList);
        if (uploadMode === 'single') {
            setFiles(newFiles.slice(0, 1)); // Only allow one file in single mode
        } else {
            setFiles(prev => [...prev, ...newFiles]); // Add files in multiple mode
        }
    }, [uploadMode]);

    const handleDragOver = (e) => e.preventDefault();
    const handleDrop = (e) => { e.preventDefault(); handleFilesReceived(e.dataTransfer.files); };
    const handleFileChange = (e) => { handleFilesReceived(e.target.files); e.target.value = null; };
    const handleRemoveFile = (fileName) => setFiles(prev => prev.filter(f => f.name !== fileName));
    
    const updateScoreCircle = useCallback((score) => {
        const scoreCircle = document.getElementById('scoreCircle');
        const scoreValue = document.getElementById('scoreValue');
        if (scoreCircle && scoreValue) {
            scoreCircle.style.background = `conic-gradient(var(--success) 0% ${score}%, var(--gray-light) ${score}% 100%)`;
            scoreValue.textContent = `${score}%`;
        }
    }, []);

    useEffect(() => { 
        if(displayedAnalysis) updateScoreCircle(displayedAnalysis.match_score); 
    }, [displayedAnalysis, updateScoreCircle]);

    const handleAnalyze = async () => {
        if (files.length === 0) return;
        setIsLoading(true);
        setReportGenerated(false);
        setFilterRange(null); // Reset filter on new analysis
        const newResumes = [];
        
        for (const file of files) {
            try {
                const formData = new FormData(); 
                formData.append('resume', file); 
                formData.append('jobDescription', jobDescription);
                
                const response = await fetch(BACKEND_CONFIG.nodejs.baseUrl + BACKEND_CONFIG.nodejs.analyzeEndpoint, { 
                    method: 'POST', 
                    body: formData 
                });
                
                const result = await response.json(); 
                if (!response.ok) throw new Error(result.error);
                
                // Create resume object
                const resumeObj = {
                    id: Date.now() + Math.random(), // temporary ID
                    fileName: file.name,
                    analysis: result
                };
                
                newResumes.push(resumeObj);
                
                // Save to Supabase if user is logged in
                if (session) { 
                    await supabase.from('analyses').insert([{ 
                        user_id: session.user.id, 
                        file_name: file.name, 
                        analysis_data: result 
                    }]); 
                }
            } catch (error) { 
                alert('Analysis failed for ' + file.name + ': ' + error.message); 
            }
        }
        
        // Update resumes state with new analyses
        if (newResumes.length > 0) {
            setResumes(prev => [...prev, ...newResumes]);
            if (newResumes.length === 1) {
                setSelectedResumeId(newResumes[0].id);
            }
        }
        
        if (session) await fetchUserHistory(session.user);
        setReportGenerated(true);
        setIsLoading(false);
        setFiles([]);
    };
    
    const logicProps = { 
        files, setFiles, jobDescription, setJobDescription, isLoading, handleAnalyze, handleDragOver, 
        handleDrop, handleFileChange, handleRemoveFile, resumes, selectedResumeId, displayedAnalysis, 
        formatFileSize, updateScoreCircle, setSelectedResumeId, reportGenerated, setReportGenerated, 
        setResults, uploadMode, setUploadMode, filterRange, setFilterRange, displayedResumes 
    };

    return (
        <div className={'App-wrapper ' + theme}>
            {!session ? <AuthPage /> : (
                <>
                    <header>
                        <div className='container'>
                            <div className='header-content'>
                                <div className='logo'><span>ResumeAI</span></div>
                                <nav><ul>
                                    <li><NavLink to='/' className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
                                    <li><NavLink to='/history' className={({ isActive }) => isActive ? 'active' : ''}>History</NavLink></li>
                                    <li><NavLink to='/settings' className={({ isActive }) => isActive ? 'active' : ''}>Settings</NavLink></li>
                                    <li><NavLink to='/help' className={({ isActive }) => isActive ? 'active' : ''}>Help</NavLink></li>
                                    <li><button className='btn-outline' style={{ marginLeft: '20px' }} onClick={() => supabase.auth.signOut()}>Logout</button></li>
                                </ul></nav>
                            </div>
                        </div>
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
                </>
            )}
        </div>
    );
}

function AppWrapper() {
    return (<BrowserRouter><App /></BrowserRouter>);
}
export default AppWrapper;