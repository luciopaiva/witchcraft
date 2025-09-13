// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeRapide from "starlight-theme-rapide";

// https://astro.build/config
export default defineConfig({
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
                { label: 'Introduction', slug: 'introduction' },
                { label: 'How to install', slug: 'how-to-install' },
                { label: 'New in version 3', slug: 'new-in-v3' },
                { label: 'User guide', slug: 'user-guide' },
                { label: 'Examples', slug: 'examples' },
                { label: 'FAQ', slug: 'faq' },
                { label: 'About', slug: 'about' },
				// {
				// 	label: 'Guides',
				// 	items: [
				// 		{ label: 'Example Guide', slug: 'guides/example' },
				// 	],
				// },
				// {
				// 	label: 'Reference',
				// 	autogenerate: { directory: 'reference' },
				// },
			],
		}),
	],
});
