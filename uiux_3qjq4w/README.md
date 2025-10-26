ResumeAI - Intelligent Resume Analysis Platform

ResumeAI is a smart web application that analyzes resumes against job descriptions. It provides match scores, skills analysis, and helpful recommendations for both job seekers and recruiters.

Features

Core Analysis Smart Resume Parsing: Extract key information from PDF, DOC, and DOCX files Job Description Analysis: Understand job requirements and qualifications Match Scoring: Percentage-based compatibility scoring Skills Detection: Find technical skills in resumes and job descriptions

Advanced Features Multi-Resume Processing: Analyze single or multiple resumes at once Skills Gap Analysis: Identify missing skills needed for the job AI-Powered Recommendations: Get personalized improvement suggestions Ranking System: Automatically rank multiple candidates by match score Visual Analytics: Interactive charts and score distribution views

User Experience Drag & Drop Interface: Easy file upload system Real-time Analysis: Live progress updates during processing Historical Data: Save and review previous analyses Dark/Light Theme: Choose your preferred interface style Responsive Design: Works on all devices

Technology Stack

Frontend React 18 - Modern UI framework React Router - Navigation and routing CSS3 - Custom styling with CSS variables HTML5 - Semantic markup

Backend Node.js - Runtime environment Express.js - Web application framework File Processing - PDF and document parsing

Database & Authentication Supabase - PostgreSQL database with real-time features Supabase Auth - Secure user authentication Row Level Security - Data protection

File Support PDF Documents Microsoft Word files (.doc, .docx)

Installation

Prerequisites Node.js (version 16 or higher) npm or yarn package manager Supabase account

Backend Setup

Clone the backend repository git clone <backend-repo-url> cd resume-ai-backend

Install dependencies npm install

Environment Configuration Create .env file: PORT=3000 SUPABASE_URL=your_supabase_url SUPABASE_ANON_KEY=your_supabase_anon_key

Start the backend server npm start or for development npm run dev

Frontend Setup

Clone the frontend repository git clone <frontend-repo-url> cd resume-ai-frontend

Install dependencies npm install

Configure Supabase Update supabaseClient.js with your credentials: const supabaseUrl = 'your_supabase_url' const supabaseAnonKey = 'your_supabase_anon_key'

Start the development server npm start

Database Schema

Analyses Table CREATE TABLE analyses ( id UUID DEFAULT gen_random_uuid() PRIMARY KEY, user_id UUID REFERENCES auth.users NOT NULL, file_name TEXT NOT NULL, analysis_data JSONB NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL );

Configuration

Backend Endpoints const BACKEND_CONFIG = { nodejs: { name: 'Node.js Express', baseUrl: 'http://localhost:3000', analyzeEndpoint: '/api/analyze' } };

Supported Skills Detection The application finds these technical skills automatically: Programming: JavaScript, Python, Java, Node.js Frontend: React, HTML, CSS Backend: Express.js, Django, Flask Databases: Supabase (PostgreSQL) Tools: Git, VScode,Deepseek,Gemini.

Usage Guide

Single Resume Analysis

Upload a resume file using drag & drop or file browser

Paste the job description in the text area

Click "Analyze Resume" to process

View match score, skills analysis, and recommendations

Multiple Resume Analysis

Switch to "Multiple Resumes" mode

Upload multiple resume files

Enter job description

Click "Analyze X Resumes" to process all files

View ranking report and filter by score ranges

Historical Analysis Access previous analyses in the History section Review detailed results for any past analysis , closing the app the history will be deleted and will not be stored. Compare different candidates over time

Customization

Themes The application supports light and dark themes: Switch between themes in Settings Automatic system theme detection Custom CSS variables for consistent styling

Styling Modify CSS variables in App.css: :root { --primary: #2563eb; --success: #10b981; --warning: #f59e0b; --danger: #ef4444; --gray: #6b7280; }

Security Features

Authentication: Secure user login with Supabase , Have used Google Authentication to just login and after that the login will not be used but if the login is through invalid mail details the login won't be possible. No, progress will be saved . Data Isolation: User-specific data access with RLS policies File Validation: Secure file type and size validation API Protection: Backend endpoint security

Analysis Metrics

The AI analysis provides these insights: Overall Match Score: Percentage compatibility Experience Match: Years and relevance assessment Skills Match Percentage: Technical skills alignment Skills Found: Detected technical competencies Missing Skills: Required skills not found in resume AI Recommendations: Actionable improvement suggestions

Developers

Maneeth Rao (maneeth1302rao@gmail.com) Ranganatha P. (ranganathapersonal@gmail.com)

Support

For help and questions: Use the Help section in the application Create an issue on GitHub

ResumeAI - Making resume analysis smarter and more efficient for everyone.

React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

@vitejs/plugin-react (https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses Babel (https://babeljs.io/) (or oxc (https://oxc.rs) when used in rolldown-vite (https://vite.dev/guide/rolldown)) for Fast Refresh @vitejs/plugin-react-swc (https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses SWC (https://swc.rs/) for Fast Refresh

React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see this documentation (https://react.dev/learn/react-compiler/installation).