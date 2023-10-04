import { BunPlugin } from "bun";
import { UnimportOptions } from "unimport";
import preprocess from 'svelte-preprocess';
import { AutoPreprocessOptions } from "svelte-preprocess/dist/types/index";
import { transpileTS } from "./utils/transpile.ts";



type Options = {
    preprocessOptions?: AutoPreprocessOptions;
    /**
     * @default false
     */
    ssr?: boolean;

};

export let generateTypes: string;
export const sveltePlugin = ( options: Options = {
    'ssr': false,
    preprocessOptions: {
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
            build.onLoad( { filter: /\.svelte$/ }, async ( { path } ) => {
                const svelte = await import( "svelte/compiler" );
                let content = await Bun.file( path ).text();
                const processed = await svelte.preprocess( content, [preprocess( options.preprocessOptions ) ] );
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

