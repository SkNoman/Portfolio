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
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);

                if (req.url === '/save') {
                    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
                    console.log('✅ portfolio.json updated');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'success', message: 'File updated on disk' }));
                } 
                else if (req.url === '/upload') {
                    // Expects { fileName: string, base64: string }
                    const { fileName, base64 } = data;
                    if (!fileName || !base64) throw new Error('Missing file data');

                    // Extract Base64 data (strip prefix like "data:image/png;base64,")
                    const matches = base64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                    if (!matches || matches.length !== 3) throw new Error('Invalid base64 string');
                    
                    const extension = matches[1];
                    const buffer = Buffer.from(matches[2], 'base64');
                    
                    // Use provided name or generate one
                    const safeName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const finalName = `${safeName}_${Date.now()}.${extension}`;
                    const filePath = path.join(IMAGES_DIR, finalName);

                    fs.writeFileSync(filePath, buffer);
                    console.log(`✅ Image saved: ${finalName}`);

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        status: 'success', 
                        url: `images/${finalName}` 
                    }));
                }
                else {
                    res.writeHead(404);
                    res.end();
                }
            } catch (err) {
                console.error('❌ Error:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: err.message }));
            }
        });
    } else {
        res.writeHead(405);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Portfolio Local Admin running at http://localhost:${PORT}`);
    console.log(`📂 Watching: ${DATA_FILE}`);
    console.log(`Press Ctrl+C to stop`);
});
