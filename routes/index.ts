import { ElysiaApp } from "../index.ts";

export default (app: ElysiaApp) => {
    app
    .get('/', (ctx) =>  'hello world')
    .post('/', (ctx) => ctx.body)

}