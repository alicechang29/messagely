import bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config.js";
import db from "../db.js";

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hpwd = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR
    );

    const result = await db.query(
      `INSERT INTO users
          (username, password, first_name, last_name, phone)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING username, password, first_name, last_name, phone`,
      [username, hpwd, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
          FROM users
          WHERE username=$1`,
      [username]
    );
    const user = result.rows[0];

    return (user && (await bcrypt.compare(
      password, user.password
    ) === true));
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    await db.query(
      `UPDATE users
      SET last_login_at=$1
      WHERE username=$2`,
      [new Date(), username]
    );

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const users = await db.query(
      `SELECT
          username,
          first_name,
          last_name
      FROM users
      ORDER BY username`
    );

    return users.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const user = await db.query(
      `SELECT
          username,
          first_name,
          last_name,
          phone,
          join_at,
          last_login_at
      FROM users
      WHERE username = $1`,
      [username]
    );
    // TODO: throw an error if no user
    return user.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `SELECT
          m.id as id,
          m.body as body,
          m.sent_at as sent_at,
          m.read_at as read_at,
          u.username as username,
          u.first_name as first_name,
          u.last_name as last_name,
          u.phone as phone
      FROM messages as m
      JOIN users as u ON m.to_username = u.username
      WHERE m.from_username = $1`,
      [username]
    );

    console.log("THE RESULTS ARE HERE --------->", results.rows);

    return results.rows
      .map(({
        id,
        body,
        sent_at,
        read_at,
        username,
        first_name,
        last_name,
        phone
      }) => {
        return {
          id,
          "to_user": { username, first_name, last_name, phone },
          body,
          sent_at,
          read_at
        }
      });
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}


export default User;
