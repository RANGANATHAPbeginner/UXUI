import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Settings Management System
class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    // Default settings
    defaultSettings = {
        theme: 'light',
        fontSize: 16,
        animations: true,
        sound: true,
        autoSave: true,
        exportFormat: 'pdf',
        primaryColor: '#2563eb',
        resultsPerPage: 10,
        notifications: true
    };

    init() {
        this.applySettings();
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.applySetting(key, value);
        this.showFeedback('Settings saved!');
    }

    applySettings() {
        Object.keys(this.settings).forEach(key => {
            this.applySetting(key, this.settings[key]);
        });
    }

    applySetting(key, value) {
        switch (key) {
            case 'theme':
                this.applyTheme(value);
                break;
            case 'fontSize':
                this.applyFontSize(value);
                break;
            case 'animations':
                this.applyAnimations(value);
                break;
            case 'sound':
                this.applySound(value);
                break;
            case 'primaryColor':
                this.applyPrimaryColor(value);
                break;
            case 'notifications':
                this.applyNotifications(value);
                break;
        }
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }

    applyFontSize(size) {
        document.documentElement.style.fontSize = `${size}px`;
    }

    applyAnimations(enabled) {
        if (enabled) {
            document.documentElement.style.setProperty('--transition', 'all 0.2s ease-in-out');
        } else {
            document.documentElement.style.setProperty('--transition', 'none');
        }
    }

    applySound(enabled) {
        // You can implement sound feedback here
        console.log('Sound enabled:', enabled);
    }

    applyPrimaryColor(color) {
        document.documentElement.style.setProperty('--primary', color);
        // Calculate darker shade for primary-dark
        const darker = this.shadeColor(color, -20);
        document.documentElement.style.setProperty('--primary-dark', darker);
    }

    applyNotifications(enabled) {
        if (enabled && 'Notification' in window) {
            Notification.requestPermission();
        }
    }

    shadeColor(color, percent) {
        let R = parseInt(color.substring(1, 3), 16);
        let G = parseInt(color.substring(3, 5), 16);
        let B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        return `#${R.toString(16).padStart(2, '0')}${G.toString(16).padStart(2, '0')}${B.toString(16).padStart(2, '0')}`;
    }

    loadSettings() {
        const saved = localStorage.getItem('appSettings');
        return saved ? { ...this.defaultSettings, ...JSON.parse(saved) } : { ...this.defaultSettings };
    }

    saveSettings() {
        localStorage.setItem('appSettings', JSON.stringify(this.settings));
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            this.settings = { ...this.defaultSettings };
            this.saveSettings();
            this.applySettings();
            this.showFeedback('Settings reset to default!');
        }
    }

    showFeedback(message) {
        let feedback = document.getElementById('settingsFeedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'settingsFeedback';
            feedback.className = 'settings-feedback';
            document.body.appendChild(feedback);
        }
        
        feedback.textContent = message;
        feedback.classList.add('show');
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 3000);
    }
}

// Create global settings manager instance
const settingsManager = new SettingsManager();

const SettingsPage = ({ theme, setTheme }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(settingsManager.settings.notifications);
  const [autoSave, setAutoSave] = useState(settingsManager.settings.autoSave);
  const [fontSize, setFontSize] = useState(settingsManager.settings.fontSize);
  const [exportFormat, setExportFormat] = useState(settingsManager.settings.exportFormat);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  useEffect(() => {
    getCurrentUser();
    // Load settings from manager
    setNotifications(settingsManager.settings.notifications);
    setAutoSave(settingsManager.settings.autoSave);
    setFontSize(settingsManager.settings.fontSize);
    setExportFormat(settingsManager.settings.exportFormat);
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    // Save all settings to the manager
    settingsManager.updateSetting('theme', theme);
    settingsManager.updateSetting('notifications', notifications);
    settingsManager.updateSetting('autoSave', autoSave);
    settingsManager.updateSetting('fontSize', fontSize);
    settingsManager.updateSetting('exportFormat', exportFormat);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleExportData = async () => {
    try {
      // Try multiple table names
      const tableNames = ['analyses', 'resume_analyses', 'user_analyses', 'analysis_history'];
      let data = null;
      
      for (const tableName of tableNames) {
        try {
          const { data: tableData, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('user_id', user?.id);
          
          if (!error && tableData && tableData.length > 0) {
            data = tableData;
            break;
          }
        } catch (err) {
          continue;
        }
      }
      
      if (!data || data.length === 0) {
        alert('No analysis history found to export.');
        return;
      }

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `resumeai-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (error) {
      alert('Error exporting data: ' + error.message);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all your analysis history? This action cannot be undone.')) {
      setIsClearingHistory(true);
      try {
        // Try different table names that might exist
        const tableNames = ['analyses', 'resume_analyses', 'user_analyses', 'analysis_history'];
        
        let cleared = false;
        let lastError = null;
        
        for (const tableName of tableNames) {
          try {
            const { error } = await supabase
              .from(tableName)
              .delete()
              .eq('user_id', user?.id);
            
            if (!error) {
              cleared = true;
              break;
            } else {
              lastError = error;
            }
          } catch (err) {
            lastError = err;
            continue;
          }
        }
        
        if (cleared) {
          alert('History cleared successfully!');
          window.location.reload();
        } else {
          alert('No analysis history found or table does not exist.');
        }
        
      } catch (error) {
        alert('Error clearing history: ' + error.message);
      } finally {
        setIsClearingHistory(false);
      }
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset all settings to default values?')) {
      settingsManager.resetSettings();
      
      // Update local state
      setNotifications(settingsManager.settings.notifications);
      setAutoSave(settingsManager.settings.autoSave);
      setFontSize(settingsManager.settings.fontSize);
      setExportFormat(settingsManager.settings.exportFormat);
      setTheme(settingsManager.settings.theme);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    settingsManager.updateSetting('theme', newTheme);
  };

  const handleNotificationsChange = (newValue) => {
    setNotifications(newValue);
    settingsManager.updateSetting('notifications', newValue);
  };

  const handleAutoSaveChange = (newValue) => {
    setAutoSave(newValue);
    settingsManager.updateSetting('autoSave', newValue);
  };

  const handleFontSizeChange = (newValue) => {
    setFontSize(newValue);
    settingsManager.updateSetting('fontSize', newValue);
  };

  const handleExportFormatChange = (newValue) => {
    setExportFormat(newValue);
    settingsManager.updateSetting('exportFormat', newValue);
  };

  return (
    <div className="page-content">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Settings</h2>
          <p>Manage your application preferences and account settings</p>
        </div>

        {/* Account Settings */}
        <div className="settings-group">
          <h3 className="settings-group-title">Account</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Email</h3>
              <p>{user?.email || 'Loading...'}</p>
            </div>
            <div className="setting-control">
              <button className="btn-outline btn-sm" data-text="Change Email">
                Change Email
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Account Created</h3>
              <p>{user ? new Date(user.created_at).toLocaleDateString() : 'Loading...'}</p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="settings-group">
          <h3 className="settings-group-title">Appearance</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Theme</h3>
              <p>Choose between light and dark mode</p>
            </div>
            <div className="setting-control">
              <div className="select-wrapper">
                <select 
                  className="select"
                  value={theme} 
                  onChange={(e) => handleThemeChange(e.target.value)}
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Font Size</h3>
              <p>Adjust the text size throughout the application</p>
              <div className="setting-status active">
                Current: {fontSize}px
              </div>
            </div>
            <div className="setting-control">
              <div className="range-container">
                <input 
                  type="range" 
                  className="range-slider"
                  min="12" 
                  max="20" 
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                />
                <span className="range-value">{fontSize}px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="settings-group">
          <h3 className="settings-group-title">Application</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Notifications</h3>
              <p>Receive notifications for analysis completion</p>
              <div className={`setting-status ${notifications ? 'active' : 'inactive'}`}>
                {notifications ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={notifications}
                  onChange={(e) => handleNotificationsChange(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Auto-save Results</h3>
              <p>Automatically save analysis results to your history</p>
              <div className={`setting-status ${autoSave ? 'active' : 'inactive'}`}>
                {autoSave ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={autoSave}
                  onChange={(e) => handleAutoSaveChange(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-group">
          <h3 className="settings-group-title">Data Management</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Export Format</h3>
              <p>Choose default format for exporting results</p>
            </div>
            <div className="setting-control">
              <div className="select-wrapper">
                <select 
                  className="select"
                  value={exportFormat}
                  onChange={(e) => handleExportFormatChange(e.target.value)}
                >
                  <option value="pdf">PDF</option>
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Export All Data</h3>
              <p>Download all your analysis data as a backup</p>
            </div>
            <div className="setting-control">
              <button className="btn-outline btn-sm" onClick={handleExportData} data-text="Export Data">
                Export Data
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Clear History</h3>
              <p>Permanently delete all your analysis history</p>
              <div className="setting-status inactive">
                This action cannot be undone
              </div>
            </div>
            <div className="setting-control">
              <button 
                className={`btn-danger btn-sm ${isClearingHistory ? 'loading' : ''}`} 
                onClick={handleClearHistory}
                disabled={isClearingHistory}
                data-text={isClearingHistory ? 'Clearing...' : 'Clear History'}
              >
                {isClearingHistory ? 'Clearing...' : 'Clear History'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="reset-settings">
          <button 
            className={`btn ${isSaving ? 'loading' : ''}`} 
            onClick={handleSaveSettings}
            disabled={isSaving}
            data-text={isSaving ? 'Saving...' : 'Save Settings'}
            style={{ marginRight: '16px' }}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
          <button 
            className="btn-outline" 
            onClick={handleResetSettings}
            data-text="Reset to Defaults"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;