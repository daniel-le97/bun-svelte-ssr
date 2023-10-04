import { Subprocess, spawn, spawnSync } from "bun";
import { WatchEventType, watch } from "fs";

import Elysia from "elysia";
import { Server } from 'bun'

// const start = Bun.nanoseconds()

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
    console.log("HMR listening on ws://localhost:8080/ws");
  }
}).listen(8080, (serv) =>{
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
    const start = Bun.nanoseconds()
    if ( filename instanceof Error )
    {
        process.exit( 1 );
    }
    
    if (filename?.includes('build' || 'node_modules') || event !== 'change') {
        
        return false
    }
        console.log( `Detected ${ event } in ${ filename }` );
    
    if ( serverProcess )
    {
        // console.log( 'Restarting server...' );
        serverProcess.kill();
        isRestarting = false;

        await serverProcess.exited;
        serverProcess = startServer();
        const tailwindcss = spawn({
            cmd: [ 'bun', 'run', 'tw' ],
            env: Bun.env,
            stdio: [ 'inherit', 'inherit', 'inherit' ]
        });
        // console.log('sending reload');
        Bun.sleepSync(1200)
        const end = Bun.nanoseconds()
        console.log('refreshed in ', (end - start) / 1000000000);
        
        server.instance?.publish('refreshEvent', 'reload')
            
    }

};

const watcher = watch(
    import.meta.dir ,
    { recursive: true },
    fileWatch
);
// const watcher2 = watch(
//     import.meta.dir + '/components',
//     { recursive: true },
//     fileWatch
// );

