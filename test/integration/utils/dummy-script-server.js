import http from 'http';

class DummyScriptServer {
    constructor() {
        this.server = null;
        this.port = null;
        this.scripts = new Map();
    }

    addScript(scriptPath, scriptContents) {
        this.scripts.set(scriptPath, scriptContents);
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => {
                console.log(`Request received for path: ${req.url}`);

                if (this.scripts.has(req.url)) {
                    let contentType = 'text/plain';
                    if (req.url.endsWith('.js')) {
                        contentType = 'application/javascript';
                    } else if (req.url.endsWith('.css')) {
                        contentType = 'text/css';
                    }

                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(this.scripts.get(req.url));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            });

            this.server.listen(0, () => {
                this.port = this.server.address().port;
                console.log(`DummyScriptServer is listening on port ${this.port}`);
                resolve(this.port);
            });

            this.server.on('error', (err) => {
                reject(err);
            });
        });
    }

    async stop() {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.server = null;
                        this.port = null;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

export default DummyScriptServer;