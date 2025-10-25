import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// --- Middlewares ---
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // Added for robustness

// Use process.cwd() for reliable pathing from the project root
const backendDir = path.join(process.cwd(), 'backend'); 

// --- Multer Storage Configuration for File Uploads ---
const uploadDir = path.join(backendDir, 'uploads'); 

// Check and create the directory
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// --- API Route for File Upload and Analysis ---
app.post('/api/analyze', upload.single('resume'), (req, res) => {
    
    // **FIXED LOGIC:** Check for all possible forms of the job description key
    const jobDescription = req.body.jobDescription || req.body.job_description || req.body.jobdescription; 
    
    const tempFilePath = req.file ? req.file.path : null;
    const fileName = req.file ? req.file.originalname : 'N/A';
    
    if (!tempFilePath || !jobDescription) {
        if (tempFilePath) fs.unlinkSync(tempFilePath);
        // This error should now only trigger if the input box is genuinely empty
        return res.status(400).json({ error: 'Missing resume file or job description.' }); 
    }

    let pythonData = '';
    let pythonError = '';
    
    const pythonScriptPath = path.join(backendDir, 'app.py');

    // 3. Spawn Python process to run the analysis script
    // --- THIS IS THE FIX ---
    // Changed 'python' to 'python3' to ensure it uses a modern Python version
    // and avoids conflicts with system-installed Python 2.
    const python = spawn('python3', [pythonScriptPath, tempFilePath, jobDescription]);

    // 4. Collect data output from Python
    python.stdout.on('data', (data) => {
        pythonData += data.toString();
    });

    // 5. Collect error output from Python
    python.stderr.on('data', (data) => {
        pythonError += data.toString();
    });

    // 6. Handle process close/exit
    python.on('close', (code) => {
        fs.unlink(tempFilePath, (err) => {
            if (err) console.error('Failed to delete temp file:', err);
        });

        if (code !== 0) {
            console.error("Python script exited with code " + code + ". Error Output:\n" + pythonError);
            return res.status(500).json({ 
                error: 'Analysis failed on the server side.', 
                details: pythonError || 'Unknown Python error.' 
            });
        }

        try {
            const analysisResult = JSON.parse(pythonData);
            analysisResult.fileName = fileName; 
            res.json(analysisResult);
        } catch (e) {
            console.error('Failed to parse Python JSON output:', e.message, 'Raw Data:', pythonData);
            res.status(500).json({ 
                error: 'Invalid analysis format received from Python.', 
                details: e.message 
            });
        }
    });
});

// --- Server Listener ---
app.listen(PORT, () => {
    console.log('Node.js Server running on port ' + PORT);
});
