// import '../assets/main.css'
// @ts-ignore
const App = (await import(globalThis.PATH_TO_PAGE))
new App.default({ target:  document.getElementById('root'), hydrate: true })
