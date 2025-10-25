import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './App.css'; 

import { supabase } from './supabaseClient';
import AuthPage from './Login';
import HistoryPage from './History';
import SettingsPage from './Settings';
import HelpPage from './Help';
import AnalysisChart from './AnalysisChart';

const BACKEND_CONFIG = {
    nodejs: { name: 'Node.js Express', baseUrl: 'http://localhost:3000', analyzeEndpoint: '/api/analyze' }
};

const renderAnalysisDetails = (data, jobDescription) => {
    const analysisData = data || { 
        match_score: 0, 
        experience_match: '-', 
        skills_match_percentage: '-', 
        skills_found: [], 
        recommendations: [] 
    };
    
    // Advanced skill detection in job description
    const detectSkillsInJD = () => {
        const skillPatterns = {
            javascript: ['javascript', 'js', 'es6', 'ecmascript'],
            python: ['python', 'django', 'flask'],
            java: ['java', 'spring', 'j2ee'],
            react: ['react', 'react.js', 'reactjs'],
            'node.js': ['node', 'node.js', 'nodejs', 'express.js'],
            html: ['html', 'html5'],
            css: ['css', 'css3', 'sass', 'scss', 'less'],
            sql: ['sql', 'mysql', 'postgresql', 'oracle', 'database'],
            mongodb: ['mongodb', 'mongo', 'nosql'],
            git: ['git', 'github', 'gitlab'],
            aws: ['aws', 'amazon web services', 's3', 'ec2', 'lambda'],
            docker: ['docker', 'container'],
            kubernetes: ['kubernetes', 'k8s']
        };

        const jdLower = jobDescription.toLowerCase();
        const detectedSkills = [];

        Object.entries(skillPatterns).forEach(([skill, patterns]) => {
            if (patterns.some(pattern => jdLower.includes(pattern))) {
                detectedSkills.push(skill);
            }
        });

        return detectedSkills;
    };

    const skillsInJD = detectSkillsInJD();
    const shouldShowSkills = skillsInJD.length > 0 || (analysisData.skills_found && analysisData.skills_found.length > 0);
    
    const foundSkills = (analysisData.skills_found || []).filter(s => s.category === 'technical').map(s => s.name);
    const missingSkills = skillsInJD.filter(s => !foundSkills.includes(s));
    
    return (
        <>
            <div className='card'>
                <div className='card-header'>
                    <h2 className='card-title'>Analysis Results</h2>
                </div>
                <div className='score-container'>
                    <div className='score-circle' id='scoreCircle'>
                        <div className='score-inner'>
                            <div id='scoreValue' className='score-value'>0%</div>
                            <div className='score-label'>MATCH SCORE</div>
                        </div>
                    </div>
                </div>
                <div className='analysis-details'>
                    <div className='detail-item'>
                        <span>Experience Match</span>
                        <span>{analysisData.experience_match || '-'}</span>
                    </div>
                    {shouldShowSkills && (
                        <div className='detail-item'>
                            <span>Skills Match</span>
                            <span>
                                {analysisData.skills_match_percentage ? 
                                    (analysisData.skills_match_percentage + '%') : 
                                    foundSkills.length > 0 && skillsInJD.length > 0 ? 
                                    Math.round((foundSkills.length / skillsInJD.length) * 100) + '%' : 
                                    '-'
                                }
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {shouldShowSkills && (
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-title'>
                            Skills Analysis
                            {skillsInJD.length > 0 && (
                                <span style={{ fontSize: '0.9rem', color: 'var(--gray)', marginLeft: '8px' }}>
                                    ({foundSkills.length}/{skillsInJD.length} matched)
                                </span>
                            )}
                        </h2>
                    </div>
                    
                    {skillsInJD.length > 0 ? (
                        <>
                            {foundSkills.length > 0 && (
                                <>
                                    <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--primary)' }}>Matched Skills</h3>
                                    <div className='skills-container'>
                                        {foundSkills.map(s => <div key={s} className='skill-tag'>{s}</div>)}
                                    </div>
                                </>
                            )}
                            
                            {missingSkills.length > 0 && (
                                <>
                                    <h3 style={{ marginTop: '20px', fontSize: '1rem', marginBottom: '12px', color: 'var(--warning)' }}>Missing Skills</h3>
                                    <div className='skills-container'>
                                        {missingSkills.map(s => <div key={s} className='skill-tag missing'>{s}</div>)}
                                        <p style={{ fontSize: '0.8rem', color: 'var(--gray)', width: '100%', marginTop: '8px' }}>
                                            These skills were mentioned in the job description but not found in the resume.
                                        </p>
                                    </div>
                                </>
                            )}
                            
                            {foundSkills.length === 0 && (
                                <p className='text-muted'>No skills from the job description were found in the resume.</p>
                            )}
                        </>
                    ) : (
                        <p className='text-muted'>
                            No specific skills mentioned in job description. 
                            {foundSkills.length > 0 && ' Found skills in resume:'}
                        </p>
                    )}
                    
                    {/* Show found skills even if no JD skills, but only if we have some */}
                    {skillsInJD.length === 0 && foundSkills.length > 0 && (
                        <>
                            <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--primary)' }}>Skills Found in Resume</h3>
                            <div className='skills-container'>
                                {foundSkills.map(s => <div key={s} className='skill-tag'>{s}</div>)}
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className='card'>
                <div className='card-header'>
                    <h2 className='card-title'>AI Recommendations</h2>
                </div>
                {(analysisData.recommendations || []).length > 0 ? 
                    analysisData.recommendations.map((rec, i) => (
                        <div key={i} className='recommendation-item'>
                            <h4>{rec.title}</h4>
                            <p>{rec.description}</p>
                        </div>
                    )) : 
                    <p className='text-muted'>No recommendations available.</p>
                }
            </div>
        </>
    );
};

const HomePage = ({ logic }) => {
    const { 
        files, jobDescription, setJobDescription, isLoading, handleAnalyze, handleDragOver, handleDrop, 
        handleFileChange, handleRemoveFile, displayedResumes, selectedResumeId, displayedAnalysis, 
        formatFileSize, setSelectedResumeId, reportGenerated, setReportGenerated, setResults,
        uploadMode, setUploadMode, filterRange, setFilterRange, resumes 
    } = logic;

    const [dragOver, setDragOver] = useState(false);

    const handleDragOverEnhanced = (e) => {
        e.preventDefault();
        setDragOver(true);
        handleDragOver(e);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDropEnhanced = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleDrop(e);
    };

    return (
        <div className='main-content'>
            <div className='left-column'>
                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-title'>Upload Resume</h2>
                    </div>
                    
                    <div className='toggle-buttons'>
                        <button 
                            onClick={() => setUploadMode('single')} 
                            className={uploadMode === 'single' ? 'active' : ''}
                        >
                            Single Resume
                        </button>
                        <button 
                            onClick={() => setUploadMode('multiple')} 
                            className={uploadMode === 'multiple' ? 'active' : ''}
                        >
                            Multiple Resumes
                        </button>
                    </div>

                    <div 
                        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
                        onDragOver={handleDragOverEnhanced}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDropEnhanced}
                    >
                        <div className='upload-icon'>📄</div>
                        <h3>Drag & Drop {uploadMode === 'single' ? 'a Resume' : 'Resumes'}</h3>
                        <p>or</p>
                        <input 
                            type='file' 
                            id={uploadMode === 'single' ? 'resumeFileSingle' : 'resumeFileMultiple'} 
                            style={{display: 'none'}} 
                            onChange={handleFileChange} 
                            multiple={uploadMode === 'multiple'}
                            accept=".pdf,.doc,.docx"
                        />
                        <button 
                            type='button' 
                            className='btn btn-secondary' 
                            onClick={() => document.getElementById(uploadMode === 'single' ? 'resumeFileSingle' : 'resumeFileMultiple').click()} 
                            disabled={isLoading}
                        >
                            {uploadMode === 'single' ? 'Browse File' : '+ Add Files'}
                        </button>
                        <p style={{ fontSize: '0.8rem', marginTop: '12px', color: 'var(--gray)' }}>
                            Supported formats: PDF, DOC, DOCX
                        </p>
                    </div>

                    {files.map(file => (
                        <div key={file.name} className='file-info'>
                            <span>{file.name} ({formatFileSize(file.size)})</span>
                            <div className="file-actions">
                                <button 
                                    className="action-btn danger" 
                                    onClick={() => handleRemoveFile(file.name)}
                                    disabled={isLoading}
                                    title="Remove file"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='card'>
                    <div className='card-header'>
                        <h2 className='card-title'>Job Description</h2>
                    </div>
                    <textarea 
                        value={jobDescription} 
                        onChange={(e) => setJobDescription(e.target.value)} 
                        disabled={isLoading}
                        placeholder="Enter the job description here..."
                    ></textarea>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button 
                            className='btn' 
                            onClick={handleAnalyze} 
                            disabled={isLoading || files.length === 0}
                        >
                            {isLoading ? 'Analyzing...' : `Analyze ${files.length} Resume${files.length !== 1 ? 's' : ''}`}
                        </button>
                        <button 
                            className='btn-outline' 
                            onClick={() => { 
                                logic.setFiles([]); 
                                logic.setJobDescription(''); 
                                logic.setResults(null); 
                                logic.setResumes([]); 
                                logic.setSelectedResumeId(null); 
                                setReportGenerated(false); 
                                setFilterRange(null); 
                            }}
                            disabled={isLoading}
                        >
                            Reset All
                        </button>
                    </div>
                </div>
                
                {reportGenerated && uploadMode === 'multiple' && resumes.length > 0 && (
                    <div className='card'>
                        <div className='card-header'>
                            <h2 className='card-title'>Score Distribution</h2>
                        </div>
                        <AnalysisChart resumes={resumes} onBarClick={(range) => setFilterRange(range)} />
                        {filterRange && (
                            <button 
                                className='btn-outline' 
                                style={{ marginTop: '12px', width: '100%' }} 
                                onClick={() => setFilterRange(null)}
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                )}
                
                {reportGenerated && displayedResumes.length > 0 && (
                    <div className='card ranking-block'>
                        <div className='card-header'>
                            <h2 className='card-title'>Ranking Report</h2>
                        </div>
                        {displayedResumes.map((resume, index) => (
                            <div 
                                key={resume.id} 
                                className={`rank-item ${selectedResumeId === resume.id ? 'selected' : ''}`}
                                onClick={() => setSelectedResumeId(resume.id)}
                            >
                                <div className={`rank-position ${index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : ''}`}>
                                    {index + 1}
                                </div>
                                <div className='rank-details'>
                                    <div>{resume.fileName}</div>
                                    <div className='rank-score'>{resume.analysis.match_score}% Match</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className='right-column'>
                {displayedAnalysis ? (
                    renderAnalysisDetails(displayedAnalysis, jobDescription)
                ) : (
                    <div className='card'>
                        <div className='card-header'>
                            <h2 className='card-title'>Analysis Results</h2>
                        </div>
                        <div className='text-center' style={{ padding: '40px 20px' }}>
                            <p className='text-muted'>Upload a resume and analyze to see results here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

function App() {
    const [session, setSession] = useState(null);
    const [theme, setTheme] = useState('light');
    const [files, setFiles] = useState([]);
    const [jobDescription, setJobDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [reportGenerated, setReportGenerated] = useState(false);
    const [uploadMode, setUploadMode] = useState('single');
    const [filterRange, setFilterRange] = useState(null);

    const displayedAnalysis = resumes.find(r => r.id === selectedResumeId)?.analysis || results;
    
    const displayedResumes = useMemo(() => {
        const sortedResumes = [...resumes].sort((a, b) => b.analysis.match_score - a.analysis.match_score);
        if (!filterRange) {
            return sortedResumes;
        }
        return sortedResumes.filter(r => r.analysis.match_score >= filterRange.min && r.analysis.match_score <= filterRange.max);
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

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchUserHistory(session.user);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    
    const handleFilesReceived = useCallback((fileList) => {
        const newFiles = Array.from(fileList);
        if (uploadMode === 'single') {
            setFiles(newFiles.slice(0, 1));
        } else {
            setFiles(prev => [...prev, ...newFiles]);
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
        setFilterRange(null);
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
                
                const resumeObj = {
                    id: Date.now() + Math.random(),
                    fileName: file.name,
                    analysis: result
                };
                
                newResumes.push(resumeObj);
                
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
                                <nav>
                                    <ul>
                                        <li><NavLink to='/' className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
                                        <li><NavLink to='/history' className={({ isActive }) => isActive ? 'active' : ''}>History</NavLink></li>
                                        <li><NavLink to='/settings' className={({ isActive }) => isActive ? 'active' : ''}>Settings</NavLink></li>
                                        <li><NavLink to='/help' className={({ isActive }) => isActive ? 'active' : ''}>Help</NavLink></li>
                                        <li>
                                            <button 
                                                className='header-btn' 
                                                onClick={() => supabase.auth.signOut()}
                                            >
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </header>
                    
                    <main className='content-wrap'>
                        <div className='container'>
                            <Routes>
                                <Route path='/' element={<HomePage logic={logicProps} />} />
                                <Route path='/history' element={<HistoryPage resumes={resumes} setSelectedResumeId={setSelectedResumeId} setResults={setResults} />} />
                                <Route path='/settings' element={<SettingsPage theme={theme} setTheme={setTheme} />} />
                                <Route path='/help' element={<HelpPage />} />
                            </Routes>
                        </div>
                    </main>
                    
                    <footer>
                        <div className='container'>
                            <div className='copyright'>
                                <p>&copy; {new Date().getFullYear()} ResumeAI Project | Developers: Maneeth Rao, Ranganatha P.</p>
                            </div>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
}

function AppWrapper() {
    return (
        <BrowserRouter>
            <App />
        </BrowserRouter>
    );
}

export default AppWrapper;