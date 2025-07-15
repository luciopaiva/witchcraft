import http from 'http';

class DummyScriptServer {
    constructor() {
        this.server = null;
        this.port = null;
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.server = http.createServer((req, res) => {
                console.log(`Request received for path: ${req.url}`);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('OK');
            });

            this.server.listen(0, () => {
                this.port = this.server.address().port;
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