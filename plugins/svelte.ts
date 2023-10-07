import { BunPlugin } from "bun";
import { UnimportOptions } from "unimport";
import preprocess from 'svelte-preprocess';
import { AutoPreprocessOptions } from "svelte-preprocess/dist/types/index";
import { transpileTS } from "./utils/transpile.ts";
import { MdsvexCompileOptions, compile, mdsvex } from "mdsvex";
import { PreprocessorGroup } from "svelte/compiler";
import { buildCache, buildServerCache } from "./cache.ts";

import markdown from 'svelte-preprocess-markdown'
type Options = {
    preprocessOptions?: AutoPreprocessOptions;
    /**
     * @default false
     */
    ssr?: boolean;

    svx?: MdsvexCompileOptions

};



export let generateTypes: string;
export const sveltePlugin = ( options: Options = {
    'ssr': false,
    preprocessOptions: {
        'markupTagName': 'svx',
        
        typescript ( { content } ) {
            const code = transpileTS( content );
            return { code };
        }
    }
} ): BunPlugin => {
    return {
        name: 'svelte loader',
        async setup ( build ) {
            const target = build.config?.target === 'browser' ? 'dom' : 'ssr';
            build.onLoad( { filter: /\.(svelte)$/ }, async ( { path } ) => {
                const cache = target === 'dom' ? buildCache : buildServerCache
                const has = cache.get(path)
                if (has) {
                   return {contents: has, loader: 'js'}
                }
                const svelte = await import( "svelte/compiler" );
                let content = await Bun.file( path ).text();
                const processed = await svelte.preprocess( content, preprocess( options.preprocessOptions )  );
                const compiled = svelte.compile( processed.code, {
                    filename: path,
                    generate: target,
                    hydratable: options.ssr,
                    // 'css': 'external'
                } );
                // console.log(compiled.css);

                cache.set(path, compiled.js.code)
                return { contents: compiled.js.code, loader: 'js' };
            } );
            build.onLoad( { filter: /\.svx$/ }, async ( { path } ) => {
                const svelte = await import( "svelte/compiler" );
                let content = await Bun.file( path ).text();
                // currently mdsvex does not work as a preprocessor directly
                // const svx = await compile(content, options.svx) 
                const processed = await svelte.preprocess( svx?.code!, markdown );

                const compiled = svelte.compile( processed.code, {
                    filename: path,
                    generate: target,
                    hydratable: options.ssr,
                } );
                return { contents: compiled.js.code, loader: 'js' };
            } );
           
        },
    };
}

