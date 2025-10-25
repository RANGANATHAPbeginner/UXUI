import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Handles the form submission with Supabase
  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        alert('Login failed: ' + error.message);
      } else {
        console.log('Login successful:', data);
        // The session will be automatically picked up by App.jsx
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Demo credentials auto-fill
  const fillDemoCredentials = () => {
    setEmail('user@example.com');
    setPassword('password123');
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.header}>Login</h2>
        <p style={styles.demoInfo}>
          Use demo credentials or create your own account
        </p>
        
        <button 
          onClick={fillDemoCredentials}
          style={styles.demoButton}
          type="button"
        >
          Fill Demo Credentials
        </button>

        <form onSubmit={handleLogin}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              placeholder="Enter your email"
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              placeholder="Enter your password"
            />
          </div>
          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div style={styles.signupLink}>
          <p>Don't have an account? <span style={styles.link} onClick={() => alert('Sign up functionality would go here')}>Sign up</span></p>
        </div>
      </div>
    </div>
  );
};

// CSS styles for the component
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  loginBox: {
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '360px',
  },
  header: {
    marginBottom: '10px',
    color: '#333',
  },
  demoInfo: {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#e9f5ff',
    border: '1px solid #b3d7ff',
    borderRadius: '4px',
    color: '#333',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  demoButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '14px',
  },
  inputGroup: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: '20px',
    fontSize: '14px',
  },
  link: {
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default AuthPage;