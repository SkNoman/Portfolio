# 🚀 Portfolio Site — Setup Guide

A full-stack Android developer portfolio with a Node.js backend and SQLite database.

---

## 📦 STEP 1: Install Node.js

If you don't have Node.js installed:

1. Go to: **https://nodejs.org**
2. Download the **LTS** (Long Term Support) version
3. Run the installer — just click Next → Next → Finish
4. **Restart your terminal/PowerShell** after installing

Verify it works:
```
node --version    # should show v20.x.x or similar
npm --version     # should show 10.x.x or similar
```

---

## 📦 STEP 2: Install Dependencies

Open a terminal in this folder (`d:\Web Projects\Portfolio`) and run:

```
npm install
```

This downloads Express, SQLite, Multer into the `node_modules` folder. Takes ~30 seconds.

---

## 🏃 STEP 3: Start the Server

```
node server.js
```

You'll see:
```
╔════════════════════════════════════════╗
║  🚀 Portfolio Server ONLINE             ║
║  http://localhost:3000                ║
╚════════════════════════════════════════╝
```

---

## 🌐 STEP 4: Open the Pages

| Page | URL |
|------|-----|
| 🏠 Portfolio (public) | http://localhost:3000 |
| 🛠️ Project Dashboard (admin) | http://localhost:3000/dashboard |
| ✏️ Edit Profile (admin) | http://localhost:3000/profile |

**Admin password:** `admin123`
(You can change this in `dashboard.html` and `profile.html` — search for `ADMIN_PASSWORD`)

---

## 📝 How to Use

### ➕ Add a Project
1. Go to `http://localhost:3000/dashboard`
2. Enter password: `admin123`
3. Fill in: Title, Description, Tech Stack (press Enter after each tag), Link, upload screenshot
4. Click **Deploy to Portfolio**
5. Refresh the main page → your project appears!

### ✏️ Edit Your Profile
1. Go to `http://localhost:3000/profile`
2. Update Name, Role, Bio, Social links
3. Upload your profile photo (instant update)
4. Upload your Resume PDF
5. Click **Update Profile**
6. Refresh main page → changes apply!

### 📬 Contact Messages
Messages from the contact form are saved to the database.
View them at: `http://localhost:3000/api/contact`

---

## 📁 Project Structure

```
Portfolio/
├── server.js          ← Main server (start this)
├── database.js        ← Database setup
├── package.json       ← Dependencies
├── index.html         ← Public portfolio page (landing)
├── dashboard.html     ← Admin: manage projects
├── profile.html       ← Admin: edit your profile
├── routes/
│   ├── profile.js     ← Profile API
│   ├── projects.js    ← Projects API
│   └── contact.js     ← Contact API
├── uploads/           ← Your uploaded files (auto-created)
│   ├── avatar/        ← Profile photo stored here
│   ├── resume/        ← Resume PDF stored here
│   └── projects/      ← Project screenshots stored here
└── portfolio.db       ← Your database (auto-created)
```

---

## 🔧 Customization Tips

- **Change admin password**: Search for `ADMIN_PASSWORD` in `dashboard.html` and `profile.html`
- **Change port**: Edit `const PORT = process.env.PORT || 3000` in `server.js`
- **Access from phone on same WiFi**: Use your PC's local IP: `http://192.168.x.x:3000`

---

## 🛑 To Stop the Server

Press `Ctrl + C` in the terminal.
