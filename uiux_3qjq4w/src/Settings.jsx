import React from 'react';
import './App.css'; 

const Settings = ({ theme, setTheme }) => {
    // LOGIC REMOVED - The switch does nothing but display the settings card
    return (
        <div className='main-content'>
            <div className='left-column'>
                <div className='card'>
                    <div className="card-header"><h2 className="card-title">Theme Customization</h2><i className="fas fa-cog" style={{color: 'var(--primary)'}}></i></div>
                    <p>Theme customization is disabled in this version for stability.</p>
                </div>
            </div>
            <div className='right-column'>
                <div className='card'>
                    <p>Application is running in the default stable theme.</p>
                </div>
            </div>
        </div>
    );
};
export default Settings;
