const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// ─── Init App ─────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML pages, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Serve uploaded files (profile photo, resume, project images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Upload Routes (Avatar + Resume) ─────────────────────────────────────
const db = require('./database');

// Avatar upload
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads', 'avatar');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar' + path.extname(file.originalname));
    }
});
const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname)) cb(null, true);
        else cb(new Error('Only image files allowed'));
    }
});

app.post('/api/upload/avatar', avatarUpload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const avatar_url = `/uploads/avatar/${req.file.filename}`;
    db.prepare('UPDATE profile SET avatar_url = ? WHERE id = 1').run(avatar_url);
    res.json({ success: true, avatar_url, message: 'Avatar updated!' });
});

// Resume upload
const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads', 'resume');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'resume' + path.extname(file.originalname));
    }
});
const resumeUpload = multer({
    storage: resumeStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (/\.(pdf|doc|docx)$/i.test(file.originalname)) cb(null, true);
        else cb(new Error('Only PDF/DOC files allowed'));
    }
});

app.post('/api/upload/resume', resumeUpload.single('resume'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const resume_url = `/uploads/resume/${req.file.filename}`;
    db.prepare('UPDATE profile SET resume_url = ? WHERE id = 1').run(resume_url);
    res.json({ success: true, resume_url, message: 'Resume uploaded!' });
});

// ─── API Routes ───────────────────────────────────────────────────────────
app.use('/api/profile', require('./routes/profile'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contact', require('./routes/contact'));

// ─── Page Routes ─────────────────────────────────────────────────────────
// Serve the HTML pages by name
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'profile.html')));

// ─── Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'online', message: 'Portfolio API running!' }));

// ─── Error Handler ────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[Error]', err.message);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log(`║  🚀 Portfolio Server ONLINE             ║`);
    console.log(`║  http://localhost:${PORT}                ║`);
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log(`  Landing Page  → http://localhost:${PORT}/`);
    console.log(`  Dashboard     → http://localhost:${PORT}/dashboard`);
    console.log(`  Profile Edit  → http://localhost:${PORT}/profile`);
    console.log('');
});
