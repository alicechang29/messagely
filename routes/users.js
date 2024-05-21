import { Router } from "express";
import User from "../models/user.js";
import { ensureLoggedIn, ensureCorrectUser } from "../middleware/auth.js";

const router = new Router();

// TODO: validation checks everywhere

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async function (req, res) {
    const users = await User.all();
    return await res.json({ users });
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async function (req, res) {
    const user = await User.get(req.params.username);
    return await res.json({ user });
});

// TODO: what happens if you use a valid token for a user that was deleted?
// TODO: how long are tokens valid for?
/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser, async function (req, res) {
    const messages = await User.messagesTo(req.params.username);

    return await res.json({ messages });
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser, async function (req, res) {
    const messages = await User.messagesFrom(req.params.username);
    return await res.json({ messages });
});

export default router;