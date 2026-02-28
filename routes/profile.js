const express = require('express');
const router = express.Router();
const db = require('../database');

// ─── GET /api/profile ─────────────────────────────────────────────────────
// Returns the single profile row
router.get('/', (req, res) => {
    try {
        const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
        res.json({ success: true, data: profile });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── PUT /api/profile ─────────────────────────────────────────────────────
// Updates profile info (name, role, bio, social links, etc.)
router.put('/', (req, res) => {
    try {
        const { name, role, bio, github, linkedin, twitter, email } = req.body;
        db.prepare(`
      UPDATE profile SET
        name     = COALESCE(@name, name),
        role     = COALESCE(@role, role),
        bio      = COALESCE(@bio, bio),
        github   = COALESCE(@github, github),
        linkedin = COALESCE(@linkedin, linkedin),
        twitter  = COALESCE(@twitter, twitter),
        email    = COALESCE(@email, email)
      WHERE id = 1
    `).run({ name, role, bio, github, linkedin, twitter, email });

        const updated = db.prepare('SELECT * FROM profile WHERE id = 1').get();
        res.json({ success: true, data: updated, message: 'Profile updated successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
