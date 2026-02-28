const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer Storage Config ────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', 'uploads', 'projects');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|svg/;
        if (allowed.test(path.extname(file.originalname).toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// ─── GET /api/projects ────────────────────────────────────────────────────
// Returns all projects ordered by newest first
router.get('/', (req, res) => {
    try {
        const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
        // Parse tech_stack JSON string into array
        const parsed = projects.map(p => ({
            ...p,
            tech_stack: JSON.parse(p.tech_stack || '[]')
        }));
        res.json({ success: true, data: parsed });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── POST /api/projects ───────────────────────────────────────────────────
// Adds a new project (multipart/form-data for image upload)
router.post('/', upload.single('image'), (req, res) => {
    try {
        const { title, description, link, status } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: 'Project title is required.' });
        }

        // tech_stack comes as a JSON string from the frontend
        let tech_stack = req.body.tech_stack || '[]';
        // Validate it's valid JSON
        try { JSON.parse(tech_stack); } catch { tech_stack = '[]'; }

        const image_url = req.file ? `/uploads/projects/${req.file.filename}` : '';

        const result = db.prepare(`
      INSERT INTO projects (title, description, tech_stack, link, image_url, status)
      VALUES (@title, @description, @tech_stack, @link, @image_url, @status)
    `).run({
            title: title.trim(),
            description: (description || '').trim(),
            tech_stack,
            link: (link || '').trim(),
            image_url,
            status: status || 'LIVE'
        });

        const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
        newProject.tech_stack = JSON.parse(newProject.tech_stack || '[]');

        res.status(201).json({ success: true, data: newProject, message: 'Project deployed to portfolio!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── PUT /api/projects/:id ───────────────────────────────────────────────
// Updates an existing project
router.put('/:id', upload.single('image'), (req, res) => {
    try {
        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        const { title, description, link, status } = req.body;
        let tech_stack = req.body.tech_stack || project.tech_stack;
        try { JSON.parse(tech_stack); } catch { tech_stack = project.tech_stack; }

        // Keep old image unless a new one was uploaded
        let image_url = project.image_url;
        if (req.file) {
            // Delete old image file if exists
            if (project.image_url) {
                const oldPath = path.join(__dirname, '..', project.image_url);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            image_url = `/uploads/projects/${req.file.filename}`;
        }

        db.prepare(`
      UPDATE projects SET
        title       = COALESCE(@title, title),
        description = COALESCE(@description, description),
        tech_stack  = @tech_stack,
        link        = COALESCE(@link, link),
        image_url   = @image_url,
        status      = COALESCE(@status, status)
      WHERE id = @id
    `).run({
            id: req.params.id,
            title: title ? title.trim() : null,
            description: description !== undefined ? description.trim() : null,
            tech_stack,
            link: link !== undefined ? link.trim() : null,
            image_url,
            status: status || null,
        });

        const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
        updated.tech_stack = JSON.parse(updated.tech_stack || '[]');
        res.json({ success: true, data: updated, message: 'Project updated!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────
// Removes a project and its image file
router.delete('/:id', (req, res) => {
    try {
        const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        // Delete image file if it exists
        if (project.image_url) {
            const filePath = path.join(__dirname, '..', project.image_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
        res.json({ success: true, message: 'Project removed from portfolio.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
