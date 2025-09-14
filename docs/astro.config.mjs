// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeRapide from "starlight-theme-rapide";

// https://astro.build/config
export default defineConfig({
	site: process.env.ASTRO_SITE || 'https://luciopaiva.com',
	base: process.env.ASTRO_BASE || '/witchcraft/',
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
