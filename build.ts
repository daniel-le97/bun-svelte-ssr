import { BunPlugin, FileSystemRouter, Target } from "bun";
import { generateTypes, sveltePlugin } from "./plugins/svelte.ts";
import * as path from 'path';
import { existsSync, rmSync } from "fs";
// import { html } from "./plugins/html.ts";
// import { postcssPlugin, generateCSS } from "./plugins/postcss.ts";
// import { BUILD_DIR} from './lib.ts'
// import { generateTypes } from "./solid.ts";

const isProd = process.env.NODE_ENV === 'production';
const PROJECT_ROOT = import.meta.dir;
const BUILD_DIR = path.resolve( PROJECT_ROOT, "build" );

export const build = async (prod = false) => {
    const router = new FileSystemRouter( {
        style: 'nextjs',
        dir: './pages',
        fileExtensions: ['.svelte']
    } );

    if ( existsSync( BUILD_DIR ) )
    {
        rmSync( BUILD_DIR, { recursive: true, force: true } );
    }

    const clientBuild = await Bun.build( {
        entrypoints: [ import.meta.dir + '/entry/entry-client.tsx', ...Object.values( router.routes ) ],
        splitting: true,
        target: 'browser',
        outdir: './build/client',
        minify: prod,
        plugins: [ sveltePlugin({ssr:true})],
    } );
    // console.log(clientBuild);
    

    const serverBuild = await Bun.build( {
        entrypoints: [import.meta.dir + '/entry/entry-server.tsx',...Object.values( router.routes ),],
        splitting: true,
        target: 'bun',
        minify: prod,
        outdir: './build/ssr',
        plugins: [sveltePlugin({ssr: true})],
    } );

    if (isProd || prod) {
        const prodBuild = await Bun.build( {
            'entrypoints': [ './dev.tsx', './index.ts'],
            'splitting': false,
            target: 'bun',
            minify: prod,
            outdir: './build',
        } );
    }

    const declarations = `
/// <reference lib='dom'/>
/// <reference lib='dom.iterable'/>\n
declare module '*.html' {
    const content: string;
    export default content;
  }\n
  declare module '*.svg' {
    const content: string;
    export default content;
  }`
// await Bun.write('./build/imports.d.ts', svelteCache)
await Bun.write('./build/lib.d.ts', declarations)
// await Bun.write('./build/ssr/main.css.js', `export default ${JSON.stringify(generateCSS)}`)
};
// Note: we are invoking this here so it can be imported and ran directly at the beginning of the file
// or we can call it from package.json
await build(true);