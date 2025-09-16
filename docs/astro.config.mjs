import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeRapide from "starlight-theme-rapide";

/** Quick and dirty plugin that:
 *  - Throws an error if relative links are found
 *  - Prepends the configured base to all absolute links (starting with /)
 */
function remarkAbsoluteLinksSimple(base = '/') {
    const prefix = `[absolute-links]`;
    let indentLevel = 0;
    const indent = () => indentLevel += 2;
    const dedent = () => indentLevel -= 2;
    const log = (msg) => console.info(`${prefix}${"  ".repeat(indentLevel)} ${msg}`);

    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;

    return (tree, file) => {
        log(`Processing file: ${file.path}`);

        function visit(node) {
            if (!node || typeof node !== "object") return;

            indent();
            // log(`node: type=${node.type} children=${Array.isArray(node.children) ? node.children.length : 0}`);

            if (node.type === "link" && typeof node.url === "string") {
                const url = node.url;
                log(`link: ${url}`);

                // fail on relative links
                if (node.url.startsWith(".")) {
                    throw new Error(`Relative links starting with './' are not supported. Please use root-relative links starting with '/' instead. Found in file ${file.path}: ${node.url}`);
                }

                if (node.url.startsWith(base)) {
                    throw new Error(`Do not include the base ('${base}') in links. Links should be root-relative starting with '/'. Found in file ${file.path}: ${node.url}`);
                }

                // prepend base to all absolute links (doesn't touch external links)
                if (node.url.startsWith('/')) {
                    node.url = `${normalizedBase}${node.url}`;
                }
            }

            for (const child of node.children || []) {
                visit(child);
            }

            dedent();
        }
        visit(tree);
    }
}

const astroBase = process.env.ASTRO_BASE || '/witchcraft/';

// https://astro.build/config
export default defineConfig({
	site: process.env.ASTRO_SITE || 'https://luciopaiva.com',
	base: astroBase,
	markdown: {
        remarkPlugins: [[remarkAbsoluteLinksSimple, astroBase]],
	},
	integrations: [
		starlight({
			title: '',
            logo: {
                src: "./src/assets/title.png",
            },
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/luciopaiva/witchcraft' }],
            plugins: [starlightThemeRapide()],
			customCss: [
				'./src/styles/global.css',
			],
			sidebar: [
                {
                    label: 'Guide',
                    items: [
                        { label: 'Introduction', slug: 'introduction' },
                        { label: 'How to install', slug: 'how-to-install' },
                        { label: 'How to use', slug: 'user-guide' },
                        { label: 'New in version 3', slug: 'new-in-v3' },
                        { label: 'FAQ', slug: 'faq' },
                        { label: 'Credits', slug: 'credits' },
                    ]
                },
                // {
                //     label: 'Cookbook',
                //     autogenerate: { directory: 'cookbook' },
                // },
			],
		}),
	],
});
