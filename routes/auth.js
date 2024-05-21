import express from "express";
import jwt from "jsonwebtoken";

import { UnauthorizedError, BadRequestError } from "../expressError.js";
import { SECRET_KEY } from "../config.js";
import User from "../models/user.js";

const router = new express.Router();

/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res, next) {
    if (
        req.body === undefined ||
        req.body.username === undefined ||
        req.body.password === undefined
    ) {
        throw new BadRequestError();
    }

    const { username, password } = req.body;

    if (await User.authenticate(username, password) === true) {
        const token = jwt.sign({ username }, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({ token });
    }

    throw new UnauthorizedError();

});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register",
    async function (req, res, next) {
        if (
            req.body === undefined ||
            req.body.username === undefined ||
            req.body.password === undefined ||
            req.body.first_name === undefined ||
            req.body.last_name === undefined ||
            req.body.phone === undefined
        ) {
            throw new BadRequestError();
        }

        const user = await User.register(req.body);

        const username = user.username;

        const token = jwt.sign({ username }, SECRET_KEY);
        return res.json({ token });
    });

export default router;
