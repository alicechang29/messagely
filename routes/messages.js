import express from "express";
import Message from "../models/message.js";
import User from "..models/user.js";

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
router.get("/:id", async function () {
  const msgId = req.params.id;

  const message = await Message.get(msgId);

  return { message };
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", async function () {
  const fromUsername = res.locals.user;
  const toUsername = req.body.to_username;
  const body = req.body.body;

  const message = await Message.create(fromUsername, toUsername, body);

  return { message };
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/


export default router;