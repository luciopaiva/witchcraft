import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import * as fs from 'node:fs';
import * as path from 'node:path';

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
        // TODO this does not work with minification
        {
            name: "modify-constants",
            writeBundle: {
                order: "post",
                handler: async () => {
                    const constantsPath = path.resolve("../dist/constants.js");
                    if (fs.existsSync(constantsPath)) {
                        let content = fs.readFileSync(constantsPath, "utf8");
                        content = content.replace(
                            /export const SERVER_PING_PERIOD_IN_MILLIS = 5000;/,
                            "export const SERVER_PING_PERIOD_IN_MILLIS = 10;"
                        );
                        fs.writeFileSync(constantsPath, content, "utf8");
                        console.log("✓ Modified SERVER_PING_PERIOD_IN_MILLIS to 10 for integration tests");
                    }
                }
            }
        }
    ]
});
