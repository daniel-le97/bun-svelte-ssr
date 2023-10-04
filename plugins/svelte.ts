import { BunPlugin } from "bun";
import { UnimportOptions } from "unimport";
import preprocess from 'svelte-preprocess';
import { AutoPreprocessOptions } from "svelte-preprocess/dist/types/index";
import UnocssSveltePreprocess from "@unocss/svelte-scoped/preprocess";
export const transpileTS = ( code: string, loader: 'ts' | 'js' = 'ts' ) => {
    const transpiler = new Bun.Transpiler( { loader } );
    const content = transpiler.transformSync( code );
    return content;
};

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

            const { createUnimport } = await import( "unimport" );
            const { injectImports, generateTypeDeclarations, scanImportsFromDir } = createUnimport( {
                'presets': [ 'svelte' ],
                // you can add additional import statements youd like to auto import here
                // imports: [ { name: 'Component', from: 'solid-js', 'type': true } ]
            } as UnimportOptions );

            // register the components|utils directory for auto importing
            await scanImportsFromDir( [ './components/**', './utils/**' ], {
                'filePatterns': [ '*.{svelte,tsx,jsx,ts,js,mjs,cjs,mts,cts,vue}' ]
            } );

            // we dont want to write here because this plugin gets registered twice
            // assign the output to a global variable and write to disk after build step has finished
            const target = build.config.target === 'browser' ? 'dom' : 'ssr';
            generateTypes = await generateTypeDeclarations();
            // console.log(generateTypes);

            // tsx loader
            build.onLoad( { filter: /\.svelte$/ }, async ( { path } ) => {
                const svelte = await import( "svelte/compiler" );
                let content = await Bun.file( path ).text();

                const processed = await svelte.preprocess( content, [ UnocssSveltePreprocess(),preprocess( options.preprocessOptions ) ] );

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

