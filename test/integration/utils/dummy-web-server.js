import http from 'http';

class DummyWebServer {
    constructor() {
        this.server = null;
        this.port = null;
        this.pages = new Map();
        this.cspPolicy = null; // Add CSP policy support
    }

    addPage(pagePath, pageContents) {
        this.pages.set(pagePath, pageContents);
    }

    // Add method to set CSP policy
    setCSPPolicy(policy) {
        this.cspPolicy = policy;
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => {
                if (this.pages.has(req.url)) {
                    let contentType = 'text/html';
                    if (req.url.endsWith('.css')) {
                        contentType = 'text/css';
                    }

                    const headers = { 'Content-Type': contentType };

                    // Add CSP header if policy is set
                    if (this.cspPolicy) {
                        headers['Content-Security-Policy'] = this.cspPolicy;
                    }

                    res.writeHead(200, headers);
                    res.end(this.pages.get(req.url));
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not Found');
                }
            });

            this.server.listen(0, () => {
                this.port = this.server.address().port;
                console.log(`DummyWebServer is listening on port ${this.port}`);
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

export default DummyWebServer;
