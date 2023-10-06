import { Subprocess, spawn, spawnSync } from "bun";
import { WatchEventType, watch } from "fs";
import Elysia from "elysia";
import { Server } from 'bun'
import { BUILD_DIR } from "./lib.ts";
import { clientBuild } from "./plugins/utils/buildOne.ts";
import { build } from "./build.ts";
import { buildCache, buildServerCache } from "./plugins/cache.ts";
import chokidar from 'chokidar'

// const start = Bun.nanoseconds()
// await build(false)

let serverProcess: Subprocess | null = null;
let isRestarting = false;

const server: { instance: null | Server } = { instance: null }

// we need a seperate server instance because the main one will turn off while reloading
const app = new Elysia()
.ws('/ws', {
  message(ws, message) {
      ws.send('hello world!')
  },
  open ( ws ) {
    ws.subscribe('refreshEvent')
    console.log("LiveReload listening on ws://localhost:8127/ws");
  }
}).listen(8127, (serv) =>{
    server.instance = serv
})


function startServer() {
    isRestarting = true;
    // console.log( 'Starting server...' );
    serverProcess = spawn( {
        cmd: [ 'bun', 'index.ts' ],
        env: Bun.env,
        stdio: [ 'inherit', 'inherit', 'inherit' ]
    } );
    const exitCode = serverProcess.exitCode;
    if ( exitCode )
    {
        process.exit( exitCode );
    }
    return serverProcess;
}

// Start the server initially
startServer();




const fileWatch = async ( event: WatchEventType, filename: string | Error | undefined ) => {
    // const start = Bun.nanoseconds()
    // console.log(filename);
    
    if ( filename instanceof Error )
    {
        process.exit( 1 );
    }

    if ( !filename || event !== 'change' )
    {
        return;
    }

    const exclude = [ 'build', 'node_modules', '.git' , '.css'];
    if ( exclude.find( excl => filename?.includes( excl ) ) )
    {
        return;
    }
    if ( !serverProcess )
    {
        return;
    }

    console.log( `Detected ${ event } in ${ filename }` );
    buildCache.forEach( ( value, key ) => {
        // key.includes(filename)
        if ( key.includes( filename ) )
        {
            buildCache.set( key, '' );
            buildServerCache.set( key, '' );
        }
    } );
    const start = performance.now()
    await build( false )
    const end = performance.now();
    const elapsedMilliseconds = end - start
    console.log( `rebundled in: ${ elapsedMilliseconds } ms` );

    isRestarting = false;
    // console.log('refreshed in ', (end - start) / 1000000);
        
    server.instance?.publish('refreshEvent', 'reload')
            
};



const watcher = watch(
    import.meta.dir,
    { recursive: true },
    fileWatch
);