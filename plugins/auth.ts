import { betterSqlite3 } from "@lucia-auth/adapter-sqlite";
import { lucia } from "lucia";
import db from "../db/db.ts";
import { elysia } from "lucia/middleware";
import Lucia from "@elysiajs/lucia-auth";
import Elysia ,{t} from "elysia";

export const auth = lucia({
	adapter: betterSqlite3(db,{user: 'user', 'session': 'user_session', key: 'user_key'}),
	middleware: elysia(),
	env: "DEV"
});

// auth.createUser({})


// const { elysia, lucia, oauth } = Lucia({

//     adapter: betterSqlite3(db,{user: 'user', 'session': 'user_session', key: 'user_key'}),
//     'env': 'DEV'
// })
    
// const auth = new Elysia({ prefix: '/auth' })
//     .use(elysia)
//     .use(
//         oauth.github({
//             clientId: GH_CLIENT_ID,
//             clientSecret: GH_CLIENT_SECRET
//         })
//     )
//     .guard(
//         {
//             body: t.Object({
//                 username: t.String(),
//                 password: t.String()
//             })
//         },
//         (app) =>
//             app
//                 .put('/sign-up', async ({ body, user }) => user.signUp(body))
//                 .post(
//                     '/sign-in',
//                     async ({ user, body: { username, password } }) => {
//                         await user.signIn(username, password)

//                         return `Sign in as ${username}`
//                     }
//                 )
//     )
//     .guard(
//         {
//             beforeHandle: ({ user: { validate } }) => validate()
//         },
//         (app) =>
//             app
//                 .get('/profile', ({ user }) => user.data)
//                 .delete('/profile', async ({ user }) => {
//                     await user.delete({
//                         'confirm': 'DELETE ALL USER DATA and is not reversible'
//                     })

//                     return 'Signed out'
//                 })
//                 .get('/sign-out', async ({ user }) => {
//                     await user.signOut()

//                     return 'Signed out'
//                 })
//     )