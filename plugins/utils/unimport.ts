
import {UnimportOptions, Import, createUnimport} from 'unimport'
import getAllFiles from './getAllFiles.ts';


export const autoImport = async() =>{
    const components = await getAllFiles([process.cwd() + '/components'])
        let imports: Import[] = []
        for (const [component, path] of Object.entries(components)){
            const as = (file: string) =>{
                const name = file.split('.')[0]
                return name.charAt(0).toUpperCase() + name.slice(1)
            }
            const newImport: Import = {
                'name': 'default',
                'as': as(component),
                'from': path,
            }
            imports.push(newImport)
        }
        return createUnimport( {
            'presets': [ 'svelte', 'svelte/animate', 'svelte/easing', 'svelte/motion', 'svelte/store', 'svelte/transition' ],
            imports
        } as UnimportOptions );
} 



// await Bun.write('./auto-import.d.ts', await(await autoImport()).generateTypeDeclarations())
