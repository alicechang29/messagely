import express from "express";
import { ensureLoggedIn, ensureCorrectUser } from "../middleware/auth.js";
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
  async function () {
    const msgId = req.params.id;
    const message = await Message.get(msgId);
    const user = res.locals.user;

    if (user === message.from_user || user === message.to_user) {
      return { message };
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
  async function () {
    if (
      req.body.to_username === undefined ||
      req.body.body === undefined
    ) {
      throw new BadRequestError();
    }

    const fromUsername = res.locals.user;
    const toUsername = req.body.to_username;
    const body = req.body.body;

    if (User.get(toUsername)) {
      const message = await Message.create(fromUsername, toUsername, body);

      return { message };
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
  ensureCorrectUser,
  async function () {

    const id = req.query.params;

    const user = res.locals.user;

    let message = await Message.get(id);

    if (message.toUsername === user.username) {
      message = await Message.markRead(id);
      return { message };
    }

    throw new UnauthorizedError();
  });



export default router;