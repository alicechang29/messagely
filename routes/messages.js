import express from "express";
import { ensureLoggedIn } from "../middleware/auth.js";
import Message from "../models/message.js";
import { UnauthorizedError } from "../expressError.js";
import User from "../models/user.js";

const router = new express.Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id",
  ensureLoggedIn,
  async function (req, res) {
    const id = req.params.id;
    const message = await Message.get(id);
    const user = res.locals.user.username;

    if (
      user === message.from_user.username ||
      user === message.to_user.username
    ) {
      return res.json({ message });
    }

    throw new UnauthorizedError();

  });

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/",
  ensureLoggedIn,
  async function (req, res) {
    if (
      req.body.to_username === undefined ||
      req.body.body === undefined
    ) {
      throw new BadRequestError();
    }

    const fromUsername = res.locals.user.username;
    const toUsername = req.body.to_username;
    const body = req.body.body;

    if (User.get(toUsername)) {
      const message = await Message.create({ fromUsername, toUsername, body });

      return res.json({ message });
    }

  });

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read",
  ensureLoggedIn,
  async function (req, res) {

    const id = req.params.id;

    const user = res.locals.user.username;

    let message = await Message.get(id);

    if (message.to_user.username === user) {
      message = await Message.markRead(id);
      return res.json({ message });
    }

    throw new UnauthorizedError();
  });



export default router;