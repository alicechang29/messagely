import {
  describe,
  test,
  expect,
  beforeEach,
  afterAll,
} from "vitest";

import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../app.js";
import db from "../db.js";
import User from "../models/user.js";
import Message from "../models/message.js";

let u1, u2, m1, m2;


describe("Messages routes test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");
    await db.query("ALTER TABLE messages ALTER COLUMN id RESTART WITH 1");

    u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });
    u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155552222",
    });
    m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "u1-to-u2",
    });
    m2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "u2-to-u1",
    });
  });


  /** POST /auth/register => token  */

  describe("GET /messages/:id", async function () {
    test("get a message by id", async function () {

      let response = await request(app)
        .post("/auth/login")
        .send({ username: "test1", password: "password" });

      let token = await response.body.token;

      const result = await db.query(
        `
        SELECT body
        FROM messages
        WHERE id=${m1.id}
        `
      );

      response = await request(app).get(`/messages/${m1.id}`).query({ _token: token });
      expect(response.body).toEqual({
        message: {
          id: 1,
          from_user: {
            username: 'test1',
            first_name: 'Test1',
            last_name: 'Testy1',
            phone: '+14155550000'
          },
          to_user: {
            username: 'test2',
            first_name: 'Test2',
            last_name: 'Testy2',
            phone: '+14155552222'
          },
          body: 'u1-to-u2',
          sent_at: expect.any(String),
          read_at: null
        }
      });
      //TODO: add a fail case and status codes
    });
  });
});

afterAll(async function () {
  await db.end();
});
