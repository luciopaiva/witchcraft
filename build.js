#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const SOURCE_DIR = './chrome-extension';
const DIST_DIR = './dist';

/**
 * Recursively copy directory contents
 */
async function copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });

    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

/**
 * Modify constants.js to set SERVER_PING_PERIOD_IN_MILLIS to 10 for integration tests
 */
async function modifyConstants() {
    const constantsPath = path.join(DIST_DIR, 'constants.js');
    let content = await fs.readFile(constantsPath, 'utf8');

    // Replace SERVER_PING_PERIOD_IN_MILLIS value from 5000 to 10
    content = content.replace(
        /export const SERVER_PING_PERIOD_IN_MILLIS = 5000;/,
        'export const SERVER_PING_PERIOD_IN_MILLIS = 10;'
    );

    await fs.writeFile(constantsPath, content, 'utf8');
    console.log('✓ Modified SERVER_PING_PERIOD_IN_MILLIS to 10 for integration tests');
}

/**
 * Main build function
 */
async function build() {
    try {
        // Clean dist directory
        try {
            await fs.rm(DIST_DIR, { recursive: true, force: true });
        } catch (error) {
            // Directory doesn't exist, that's fine
        }

        console.log('✓ Cleaned dist directory');

        // Copy chrome-extension to dist
        await copyDirectory(SOURCE_DIR, DIST_DIR);
        console.log('✓ Copied chrome-extension to dist');

        // Modify constants for integration tests
        await modifyConstants();

        console.log('✓ Build completed successfully');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
