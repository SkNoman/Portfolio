const express = require('express');
const router = express.Router();
const db = require('../database');

// ─── POST /api/contact ────────────────────────────────────────────────────
// Saves a contact form submission
router.post('/', (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
        }

        db.prepare(`
      INSERT INTO contacts (name, email, message)
      VALUES (@name, @email, @message)
    `).run({ name: name.trim(), email: email.trim(), message: message.trim() });

        console.log(`[Contact] New message from ${name} <${email}>`);
        res.json({ success: true, message: 'Message received! I will get back to you soon.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── GET /api/contact ─────────────────────────────────────────────────────
// View all received messages (admin use)
router.get('/', (req, res) => {
    try {
        const messages = db.prepare('SELECT * FROM contacts ORDER BY received_at DESC').all();
        res.json({ success: true, data: messages });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
