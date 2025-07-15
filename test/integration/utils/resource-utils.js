import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadResource(resourcePath) {
    // load a file using fs from the test/integration/resources directory
    const fullPath = path.join(__dirname, '..', 'resources', resourcePath);
    try {
        const content = await fs.promises.readFile(fullPath, 'utf8');
        return content;
    } catch (error) {
        throw new Error(`Failed to load resource '${resourcePath}': ${error.message}`);
    }
}
