import { BunPlugin, FileSystemRouter, Target } from "bun";
import { generateTypes, sveltePlugin } from "./plugins/svelte.ts";
import * as path from 'path';
import { existsSync, rmSync } from "fs";
import { html } from "./plugins/html.ts";
import { postcssAPI } from "./plugins/postcss.ts";
// import { restarting } from "./plugins/cache.ts";

const isProd = process.env.NODE_ENV === 'production';
const PROJECT_ROOT = process.cwd();
const BUILD_DIR = path.resolve( PROJECT_ROOT, "build" );

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

let hasbuilt = false

export const build = async (prod = false) => {
    try {
        
        // const start = performance.now();
        if ( hasbuilt === true )
        {
            return;
        }
        // hasbuilt = true
        
        console.log('rebuilding bundle..');
        
        
        
        const router = new FileSystemRouter( {
            style: 'nextjs',
            dir: './pages',
            fileExtensions: ['.svelte', '.svx']
        } );
        
        // 
        if ( existsSync( BUILD_DIR ) )
        {
            // clear the necessary directories for our rebuild that follows
            rmSync( BUILD_DIR + '/client', { recursive: true, force: true } );
            rmSync( BUILD_DIR + '/ssr', { recursive: true, force: true } );
        }
        
        // our postcss/tailwind build step
        const cssBuild = await postcssAPI(
            PROJECT_ROOT + '/assets/app.css',
            PROJECT_ROOT + '/assets/output.css' )
            
            // builds the files our client will be fetching
            const clientBuild = await Bun.build( {
                entrypoints: [ import.meta.dir + '/entry/entry-client.tsx', ...Object.values( router.routes ) ],
                splitting: true,
                target: 'browser',
                outdir: './build/client',
                minify: prod,
                plugins: [ sveltePlugin({ssr:true})],
            } );
            
            // builds the files our server will be using
            const serverBuild = await Bun.build( {
                entrypoints: [import.meta.dir + '/entry/entry-server.tsx',...Object.values( router.routes ),],
                splitting: true,
                target: 'bun',
                minify: prod,
                outdir: './build/ssr',
                plugins: [sveltePlugin({ssr: true})],
            } );
            if (serverBuild.success && clientBuild.success) {
                hasbuilt = true
            }
            
            // build these files only once
            if (isProd || prod) {
                const prodBuild = await Bun.build( {
                    'entrypoints': ['./index.ts'],
                    'splitting': false,
                    target: 'bun',
                    minify: prod,
                    outdir: './build',
                    plugins: [html]
                } );
                await Bun.write('./build/lib.d.ts', declarations) 
            }
            
            if (!isProd) {
                const rebuilt = clientBuild.success && serverBuild.success
                const status = `rebuilt successfully: ${rebuilt}`
                console.log(status);
                
            }
            hasbuilt = false;
            return {clientBuild, serverBuild}
            
        } catch (error) {
            // error handling needs to be done here
        }
        };
        
        // Note: we are invoking this here so it can be imported and ran directly at the beginning of the file
        // or we can call it from package.json
        ( await build( true ) );
        