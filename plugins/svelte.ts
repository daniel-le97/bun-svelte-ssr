import { BunPlugin } from "bun";
import { UnimportOptions } from "unimport";
import preprocess from 'svelte-preprocess';
import { AutoPreprocessOptions } from "svelte-preprocess/dist/types/index";
import { transpileTS } from "./utils/transpile.ts";
import { MdsvexCompileOptions, compile, mdsvex } from "mdsvex";
import { PreprocessorGroup } from "svelte/compiler";
import { buildCache, buildServerCache } from "./utils/cache.ts";
import { autoImport } from "./utils/unimport.ts";

type Options = {
    preprocessOptions?: AutoPreprocessOptions;
    /**
     * @default false
     */
    ssr?: boolean;

    svx?: MdsvexCompileOptions

};

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
     
            build.onLoad( { filter: /\.(svelte|svx)$/ }, async ( { path } ) => {
                const cache = target === 'dom' ? buildCache : buildServerCache
                const has = cache.get(path)

                if (has) {
                   return {contents: has, loader: 'js'}
                }
                const svelte = await import( "svelte/compiler" );
                let content = await Bun.file( path ).text();

                if (path.includes('.svx')) {   
                    content = (await (await import('mdsvex')).compile(content, options.svx))?.code ?? ''
                }

                const injectImports = await (await autoImport()).injectImports(content)
    
                const processed = await svelte.preprocess( injectImports.code, preprocess( options.preprocessOptions )  );
                const compiled = svelte.compile( processed.code, {
                    filename: path,
                    generate: target,
                    hydratable: options.ssr,
                    css: options.ssr ? 'external' : 'injected'
                } );

                cache.set(path, compiled.js.code)
                return { contents: compiled.js.code, loader: 'js' };
            } );
        },
    };
}

