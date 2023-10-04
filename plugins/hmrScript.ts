export const hmr = `
    window.addEventListener('load', () => {
    const ws = new WebSocket('ws://localhost:8080/ws');
    ws.addEventListener('message', (data) => {
      const message = data.data
      if (message === 'reload' || message === window.location.pathname) {
        console.log('Reloading...');
        window.location.reload();
      }
    })
    ws.addEventListener('open', () => {
      // Send current pathname to server
      ws.send(window.location.pathname);
    });
    window.addEventListener("beforeunload", () => {
      if(ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
  });`