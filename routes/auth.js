import express from "express";

const router = new express.Router();

/** POST /login: {username, password} => {token} */


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

export default router;
