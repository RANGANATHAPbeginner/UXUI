import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Make sure this import path is correct

/**
 * AuthPage Component
 * A cyberpunk-themed authentication page with Google OAuth
 * Features: Grid background, terminal display, status badges, cyber aesthetics
 */
const AuthPage = () => {
  // ==================== STATE MANAGEMENT ====================
  
  // Loading state for authentication process
  const [loading, setLoading] = useState(false);
  
  // Error message state for displaying authentication errors
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Terminal text state for rotating security messages
  const [terminalText, setTerminalText] = useState('> Firewall: Enabled');
  
  // Cursor visibility for blinking effect
  const [cursorVisible, setCursorVisible] = useState(true);

  // ==================== SIDE EFFECTS ====================
  
  useEffect(() => {
    // Array of terminal messages to cycle through
    const messages = [
      '> Firewall: Enabled',
      '> Encryption: AES-256',
      '> Security Protocols: Active',
      '> System: Ready',
      '> Authentication: Online'
    ];
    
    let messageIndex = 0;
    
    // Interval to rotate through terminal messages every 3 seconds
    const terminalInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setTerminalText(messages[messageIndex]);
    }, 3000);

    // Cursor blink interval for terminal effect
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);

    // Cleanup function to clear intervals on component unmount
    return () => {
      clearInterval(terminalInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  // ==================== EVENT HANDLERS ====================
  
  /**
   * Handle Google OAuth login
   * Sets loading state, updates terminal, and processes authentication
   */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    setTerminalText('> Initiating Authentication...');
    
    try {
      // Supabase Google OAuth
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/` // Redirect after successful login
        }
      });
      
      if (error) {
        throw error;
      }
      
      // If successful, Supabase will redirect the user
      // The redirect will be handled by your app's auth state management
      
    } catch (error) {
      // Handle authentication errors
      console.error('Google OAuth error:', error);
      setErrorMsg('Authentication failed: ' + error.message);
      setTerminalText('> System Error');
    } finally {
      // Reset loading state regardless of success/failure
      setLoading(false);
    }
  };

  // ==================== RENDER ====================
  
  return (
    <>
      {/* ==================== EMBEDDED STYLES ==================== */}
      <style>{`
        /* Reset and isolate from global styles */
        .auth-container * {
          all: unset;
          display: revert;
          box-sizing: border-box;
        }

        /* Global Reset */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Body Styles - White background with grid */
        body {
          background: #ffffff !important;
          font-family: 'Segoe UI', 'SF Mono', 'Monaco', 'Inconsolata', monospace !important;
          color: #1a1a1a !important;
          line-height: 1.6;
          height: 100vh;
          overflow: hidden;
        }

        /* Main Container - Centers auth box with grid background */
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
          position: relative;
        }

        /* Grid Background - Animated darker grid pattern on white */
        .grid-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(0, 0, 0, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.15) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 0;
          animation: gridMove 20s linear infinite;
        }

        /* Grid Movement Animation - Subtle moving effect */
        @keyframes gridMove {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 50px 50px;
          }
        }

        /* Authentication Box - Black card container with animations */
        .auth-box {
          width: 100%;
          max-width: 450px;
          background: #000000;
          border: 1px solid #333333;
          position: relative;
          overflow: hidden;
          z-index: 1;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.6s ease-out;
        }

        /* Slide Up Animation - Card entrance */
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Status Bar - Top bar with animated security badges on black */
        .status-bar {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: #0a0a0a;
          border-bottom: 1px solid #222222;
          animation: fadeIn 0.8s ease-out 0.2s both;
        }

        /* Fade In Animation - For status bar */
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        /* Status Badge - Individual status indicator with pulse */
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 2px;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          animation: pulse 2s ease-in-out infinite;
        }

        /* Pulse Animation - Subtle breathing effect */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        /* Secure Badge - Green themed */
        .status-secure {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #16a34a;
        }

        /* Online Badge - Blue themed */
        .status-online {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #2563eb;
        }

        /* Status Icon - Lock and arrow symbols */
        .status-icon {
          font-size: 0.7rem;
        }

        /* Content Wrapper - Inner padding for all content */
        .content-wrapper {
          padding: 48px 40px 40px;
        }

        /* Main Title - Glitchy hacker-style heading */
        .main-title {
          font-size: 2.5rem;
          font-weight: 700;
          letter-spacing: 4px;
          margin-bottom: 12px;
          color: #ffffff;
          text-align: center;
          text-transform: uppercase;
          animation: fadeInUp 0.8s ease-out 0.3s both, glitch 3s infinite;
          position: relative;
        }

        /* Glitch Animation - Hacker vibes every 3 seconds */
        @keyframes glitch {
          0%, 90%, 92%, 94%, 96%, 98%, 100% {
            transform: translate(0, 0);
            text-shadow: none;
          }
          91% {
            transform: translate(-2px, 1px);
            text-shadow: 2px 0 #00ff9d, -2px 0 #ff0080;
          }
          93% {
            transform: translate(2px, -1px);
            text-shadow: -2px 0 #00ff9d, 2px 0 #ff0080;
          }
          95% {
            transform: translate(-1px, 2px);
            text-shadow: 1px 0 #00ff9d, -1px 0 #ff0080;
          }
          97% {
            transform: translate(1px, -2px);
            text-shadow: -1px 0 #00ff9d, 1px 0 #ff0080;
          }
          99% {
            transform: translate(-2px, -1px);
            text-shadow: 2px 0 #00ff9d, -2px 0 #ff0080;
          }
        }

        /* Fade In Up Animation - Title entrance */
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Subtitle - Secondary descriptive text with animation on black */
        .subtitle {
          color: #999999;
          font-size: 0.8rem;
          margin-bottom: 32px;
          text-align: center;
          font-weight: 400;
          letter-spacing: 4px;
          text-transform: uppercase;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        /* Separator Line - Animated visual divider on black */
        .separator {
          height: 1px;
          background: linear-gradient(90deg, transparent, #333333, transparent);
          margin: 24px 0;
          border: none;
          animation: fadeIn 0.8s ease-out 0.5s both;
        }

        /* Terminal Container - Status display box with animation on black */
        .terminal {
          background: #0a0a0a;
          border: 1px solid #222222;
          border-radius: 4px;
          margin: 24px 0;
          overflow: hidden;
          animation: scaleIn 0.6s ease-out 0.6s both;
        }

        /* Scale In Animation - Terminal entrance */
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Terminal Header - Contains colored dots on black */
        .terminal-header {
          background: #151515;
          padding: 10px 14px;
          border-bottom: 1px solid #222222;
        }

        /* Terminal Dots Container - Holds MacOS-style dots */
        .terminal-dots {
          display: flex;
          gap: 6px;
        }

        /* Individual Terminal Dot - Colored status indicators */
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        /* Terminal Content Area - Displays status messages on black */
        .terminal-content {
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          min-height: 60px;
          background: #000000;
        }

        /* Terminal Code Text - Monospace status text with typing effect */
        .terminal-content code {
          color: #00ff9d;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Courier New', monospace;
          font-weight: 500;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
          animation: typing 1s steps(30) 0.7s both;
        }

        /* Typing Animation - Terminal text effect */
        @keyframes typing {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        /* Terminal Cursor - Blinking cursor effect */
        .cursor {
          color: #00ff9d;
          margin-left: 2px;
          transition: opacity 0.1s;
          animation: blink 1s infinite;
        }

        /* Blink Animation - Cursor blinking */
        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }

        /* Authentication Button - Primary CTA with animations */
        .auth-button {
          width: 100%;
          background: #1a73e8;
          border: none;
          padding: 16px 24px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          border-radius: 4px;
          margin: 24px 0;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(26, 115, 232, 0.2);
          animation: fadeInUp 0.6s ease-out 0.8s both;
        }

        /* Button Hover State - Lift and glow effect */
        .auth-button:hover:not(:disabled) {
          background: #1557b0;
          box-shadow: 0 4px 16px rgba(26, 115, 232, 0.3);
          transform: translateY(-2px);
        }

        /* Button Active State */
        .auth-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(26, 115, 232, 0.2);
        }

        /* Button Disabled State */
        .auth-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Button Content Container - Flex layout for icon and text */
        .button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        /* Google Icon - SVG styling */
        .button-icon {
          width: 20px;
          height: 20px;
        }

        /* Button Text - Label styling with cyber aesthetic */
        .button-text {
          font-weight: 600;
          font-size: 0.95rem;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        /* Loading State - Button appearance when authenticating */
        .auth-button.loading {
          background: #5a9fd4;
          box-shadow: 0 2px 8px rgba(90, 159, 212, 0.3);
        }

        /* Loading Animation - Spin effect for icon */
        .auth-button.loading .button-icon {
          animation: spin 1s linear infinite;
        }

        /* Spin Keyframes - Rotation animation */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Error Message Container - Error alert box */
        .error-message {
          background: rgba(255, 59, 59, 0.1);
          border: 1px solid rgba(255, 59, 59, 0.4);
          border-radius: 4px;
          padding: 12px 16px;
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.875rem;
          text-align: left;
        }

        /* Error Icon - Warning symbol */
        .error-icon {
          color: #ff3b3b;
          font-size: 1rem;
          flex-shrink: 0;
        }

        /* Error Text - Error message content */
        .error-message span:last-child {
          color: #ff6b6b;
        }

        /* Footer - Version and info text with fade in */
        .footer {
          margin-top: 32px;
          font-size: 0.7rem;
          color: #9ca3af;
          text-align: center;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          animation: fadeIn 0.8s ease-out 1s both;
        }

        /* Focus State - Accessibility outline */
        .auth-button:focus {
          outline: 2px solid #1a73e8;
          outline-offset: 2px;
        }

        /* ==================== RESPONSIVE DESIGN ==================== */
        
        /* Tablet Breakpoint */
        @media (max-width: 768px) {
          .auth-box {
            max-width: 400px;
          }
          
          .content-wrapper {
            padding: 40px 32px 32px;
          }
          
          .main-title {
            font-size: 2rem;
            letter-spacing: 3px;
          }
          
          .subtitle {
            font-size: 0.75rem;
            letter-spacing: 3px;
          }
        }

        /* Mobile Breakpoint */
        @media (max-width: 480px) {
          .content-wrapper {
            padding: 32px 24px 24px;
          }
          
          .main-title {
            fontSize: 1.75rem;
            letterSpacing: 2px;
          }
          
          .subtitle {
            fontSize: 0.7rem;
            letterSpacing: 2px;
          }
          
          .button-content {
            padding: 14px 20px;
          }
          
          .footer {
            fontSize: 0.65rem;
          }
        }
      `}</style>

      {/* ==================== MAIN CONTENT ==================== */}
      
      <div className="auth-container">
        {/* Grid Background Pattern */}
        <div className="grid-background"></div>

        {/* Authentication Card */}
        <div className="auth-box">
          {/* ==================== STATUS BAR ==================== */}
          
          {/* Top Status Bar with Security Indicators */}
          <div className="status-bar">
            {/* Secure Badge - Green */}
            <div className="status-badge status-secure">
              <span className="status-icon">🔒</span>
              <span>SECURE</span>
            </div>
            {/* Online Badge - Blue */}
            <div className="status-badge status-online">
              <span className="status-icon">▸</span>
              <span>ONLINE</span>
            </div>
          </div>

          <div className="content-wrapper">
            {/* ==================== HEADER SECTION ==================== */}
            
            {/* Main Heading */}
            <h1 className="main-title">ACCESS CONTROL</h1>
            
            {/* Descriptive Subtitle */}
            <p className="subtitle">ENTERPRISE AUTHENTICATION GATEWAY</p>

            {/* Visual Separator */}
            <div className="separator"></div>

            {/* ==================== TERMINAL STATUS ==================== */}
            
            {/* Terminal Display Box */}
            <div className="terminal">
              {/* Terminal Header with MacOS-style Dots */}
              <div className="terminal-header">
                <div className="terminal-dots">
                  {/* Red Dot */}
                  <span className="dot" style={{backgroundColor: '#ff5f56'}}></span>
                  {/* Yellow Dot */}
                  <span className="dot" style={{backgroundColor: '#ffbd2e'}}></span>
                  {/* Green Dot */}
                  <span className="dot" style={{backgroundColor: '#27c93f'}}></span>
                </div>
              </div>
              {/* Terminal Content - Status Messages with Blinking Cursor */}
              <div className="terminal-content">
                <code>
                  {terminalText}
                  <span className="cursor" style={{opacity: cursorVisible ? 1 : 0}}>_</span>
                </code>
              </div>
            </div>

            {/* Visual Separator */}
            <div className="separator"></div>

            {/* ==================== AUTHENTICATION BUTTON ==================== */}
            
            {/* Google Sign In Button */}
            <button 
              className={`auth-button ${loading ? 'loading' : ''}`}
              onClick={handleGoogleLogin}
              disabled={loading}
              aria-label="Sign in with Google"
            >
              <div className="button-content">
                {/* Google Logo SVG */}
                <svg 
                  className="button-icon" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {/* Button Text - Changes based on loading state */}
                <span className="button-text">
                  {loading ? 'AUTHENTICATING...' : 'CONTINUE WITH GOOGLE'}
                </span>
              </div>
            </button>

            {/* ==================== ERROR DISPLAY ==================== */}
            
            {/* Error Message - Only shown when errorMsg exists */}
            {errorMsg && (
              <div className="error-message" role="alert">
                {/* Warning Icon */}
                <span className="error-icon" aria-hidden="true">⚠</span>
                {/* Error Message Text */}
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ==================== FOOTER INFO ==================== */}
            
            {/* Version and Security Info */}
            <div className="footer">
              <span>v2.4.1 • ENCRYPTED • {new Date().getFullYear()}</span>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;