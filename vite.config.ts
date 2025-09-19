/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

/** @type {import('vite').UserConfig} */
export default defineConfig({
    root: "src",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                "background": "src/background.js",
                "content-script": "src/content-script.js",
                "popup": "src/popup.js",
                "constants": "src/constants.js",
            },
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name].js",
                assetFileNames: "[name].[ext]"
            }
        }
    },
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: "../assets/*.*",
                    dest: "."
                }
            ]
        }),
    ],
    test: {

    }
});
