const http = require('http');
const port = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>🚀 FALLBACK SYSTEM ONLINE</h1><p>If you see this, the server is reachable.</p>');
});

server.listen(port, '0.0.0.0', () => {
    console.log(`📡 Fallback server running on port ${port}`);
});
