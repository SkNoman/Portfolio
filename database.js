const Database = require('better-sqlite3');
const path = require('path');

// Opens (or creates) portfolio.db in the project folder
const db = new Database(path.join(__dirname, 'portfolio.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// ─── Create Tables ─────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    id          INTEGER PRIMARY KEY DEFAULT 1,
    name        TEXT    DEFAULT 'Your Name',
    role        TEXT    DEFAULT 'Android Developer',
    bio         TEXT    DEFAULT 'Passionate Android developer building high-performance mobile apps with Kotlin and Jetpack Compose.',
    github      TEXT    DEFAULT '',
    linkedin    TEXT    DEFAULT '',
    twitter     TEXT    DEFAULT '',
    email       TEXT    DEFAULT '',
    avatar_url  TEXT    DEFAULT '',
    resume_url  TEXT    DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    tech_stack  TEXT    DEFAULT '[]',
    link        TEXT    DEFAULT '',
    image_url   TEXT    DEFAULT '',
    status      TEXT    DEFAULT 'LIVE',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT,
    email       TEXT,
    message     TEXT,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ─── Seed Default Profile (only on first run) ───────────────────────────────
const existingProfile = db.prepare('SELECT id FROM profile WHERE id = 1').get();
if (!existingProfile) {
  db.prepare(`
    INSERT INTO profile (id, name, role, bio)
    VALUES (1, 'Your Name', 'Android Developer', 'Passionate Android developer building high-performance mobile apps with Kotlin and Jetpack Compose.')
  `).run();
  console.log('[DB] Default profile created.');
}

// ─── Seed Sample Projects (only on first run) ───────────────────────────────
const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get();
if (projectCount.count === 0) {
  const insertProject = db.prepare(`
    INSERT INTO projects (title, description, tech_stack, link, status)
    VALUES (@title, @description, @tech_stack, @link, @status)
  `);

  insertProject.run({
    title: 'CyberFit App',
    description: 'AI-driven workout tracker with real-time biometric analysis via wearable integration.',
    tech_stack: JSON.stringify(['Kotlin', 'Compose']),
    link: '',
    status: 'LIVE'
  });

  insertProject.run({
    title: 'Neon Bank',
    description: 'Encrypted digital wallet with multi-currency support and real-time transaction notifications.',
    tech_stack: JSON.stringify(['MVVM', 'Retrofit']),
    link: '',
    status: 'LIVE'
  });

  insertProject.run({
    title: 'DroidScanner',
    description: 'Object recognition app leveraging machine learning for real-time identification through lenses.',
    tech_stack: JSON.stringify(['ML Kit', 'CameraX']),
    link: '',
    status: 'BETA'
  });

  console.log('[DB] Sample projects seeded.');
}

console.log('[DB] Database ready: portfolio.db');
module.exports = db;
