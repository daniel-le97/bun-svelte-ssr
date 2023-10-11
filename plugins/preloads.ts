import { html } from "./html.ts";
import { sveltePlugin } from "./svelte.ts";
Bun.plugin(html)

Bun.plugin(await sveltePlugin({ssr: true}))