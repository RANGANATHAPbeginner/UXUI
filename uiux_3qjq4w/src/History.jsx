import React from 'react';
import './App.css'; 
const History = ({ resumes, setSelectedResumeId, setResults }) => (
    <div className='container page-content'>
        <h2 className='card-title'>Analysis History</h2>
        <div className='card'>
            {resumes.length === 0 ? (
                <p>No analysis history found. Upload a resume on the Home page to begin tracking.</p>
            ) : (
                resumes.map(resume => (
                    <div
                        key={resume.id}
                        className={'resume-item'}
                        onClick={() => { setSelectedResumeId(resume.id); setResults(resume.analysis); }}
                        style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', marginBottom: '10px', background: 'var(--gray-light)', borderRadius: '4px', cursor: 'pointer', borderLeft: '5px solid var(--primary)' }}
                    >
                        <span>{resume.fileName} - Match: {resume.analysis.match_score}%</span>
                        <span>Analyzed: {new Date(resume.id).toLocaleTimeString()}</span>
                    </div>
                ))
            )}
        </div>
    </div>
);
export default History;
