/** Database connection for messagely. */


import pg from "pg";
const { Client } = pg;

import { DB_URI } from "./config.js";

const db = new Client(DB_URI);

db.connect();


export default db;
