const http = require('http');

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Backend is running!' }));
    } else if (req.url === '/sentences/random' && req.method === 'GET') {
        // Placeholder for P-08: Endpoint GET /sentences/random
        // TODO: Implement actual logic to read from sentences_pl.json
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ sentence: 'To jest przykładowe zdanie z backendu.', id: 100 }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
}); 