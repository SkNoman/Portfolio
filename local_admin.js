const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const DATA_FILE = path.join(__dirname, 'data', 'portfolio.json');
const IMAGES_DIR = path.join(__dirname, 'images');

// Ensure directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR);

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            console.log(`   -> Payload received: ${body.length} characters`);
            try {
                if (!body) {
                    throw new Error('Empty request body');
                }

                const data = JSON.parse(body);
                const urlPath = req.url.split('?')[0]; // Remove query strings

                if (urlPath === '/save') {
                    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
                    console.log('   ✅ portfolio.json updated successfully');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'success', message: 'File updated on disk' }));
                }
                else if (urlPath === '/upload') {
                    const { fileName, base64 } = data;
                    if (!fileName || !base64) throw new Error('Missing file name or base64 data');

                    const matches = base64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                    if (!matches || matches.length !== 3) throw new Error('Invalid image format');

                    const extension = matches[1].split('/')[0] === 'image' ? matches[1].split('/')[1] : matches[1];
                    const buffer = Buffer.from(matches[2], 'base64');

                    const safeName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const finalName = `${safeName}_${Date.now()}.${extension}`;
                    const filePath = path.join(IMAGES_DIR, finalName);

                    fs.writeFileSync(filePath, buffer);
                    console.log(`   ✅ Image saved: ${finalName}`);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        status: 'success',
                        url: `images/${finalName}`
                    }));
                }
                else {
                    console.warn(`   ⚠️  Route not found: ${urlPath}`);
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'error', message: 'Not Found' }));
                }
            } catch (err) {
                console.error('   ❌ Error processing request:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: err.message }));
            }
        });

        req.on('error', (err) => {
            console.error('   ❌ Stream error:', err);
            res.writeHead(500);
            res.end();
        });
    } else {
        res.writeHead(405);
        res.end();
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Portfolio Local Admin running at http://127.0.0.1:${PORT}`);
    console.log(`📂 Watching: ${DATA_FILE}`);
    console.log(`Press Ctrl+C to stop`);
});
