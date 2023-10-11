import Database from "bun:sqlite";
const sql = /* sql */`
CREATE TABLE IF NOT EXISTS Users(id INTEGER PRIMARY KEY AUTOINCREMENT);
`

const db = new Database('db/db.sqlite')
db.exec("PRAGMA journal_mode = WAL;");
db.query('CREATE TABLE IF NOT EXISTS Users(id INTEGER PRIMARY KEY AUTOINCREMENT);').run()

export default db