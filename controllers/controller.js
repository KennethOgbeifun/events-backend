const db = require("../db/connection");
const {
  selectEvents,
  selectEventById,
  insertEvent,
  updateEvent,
  deleteEvent,
  insertSignup,
  selectSignups,
  findTokensByUserId
} = require("../models/model");

const { addEventToCalendar } = require("../utils/calendar");

const { google } = require("googleapis");
const { createOAuthClient, generateAuthUrl, signOAuthState, verifyOAuthState } = require("../utils/google");
const { upsertTokens } = require("../models/model");
const { FRONTEND_BASE_URL = "http://localhost:5173" } = process.env;



function getHealth(req, res) {
  res.status(200).send({ ok: true, uptime: process.uptime() });
}

function getEvents(req, res, next) {
  const includeSignups = req.query.include === "counts";
  selectEvents({ includeSignups })
    .then((events) => res.status(200).send({ events }))
    .catch(next);
}

function getEventById(req, res, next) {
  selectEventById(req.params.id)
    .then((event) => res.status(200).send({ event }))
    .catch(next);
}

function postEvent(req, res, next) {
  insertEvent(req.body)
    .then((event) => res.status(201).send({ event }))
    .catch(next);
}

function patchEvent(req, res, next) {
  updateEvent(req.params.id, req.body)
    .then((event) => res.status(200).send({ event }))
    .catch(next);
}

function removeEvent(req, res, next) {
  deleteEvent(req.params.id)
    .then(() => res.status(204).send())
    .catch(next);
}

function postSignup(req, res, next) {
  const eventId = req.params.id;
  const userId = req.user.id;          
  insertSignup(eventId, { user_id: userId })
    .then((signup) => {
      
      return db.query(
        `SELECT title, description, start_time, end_time, location
         FROM events
         WHERE id = $1`,
        [eventId]
      ).then(({ rows }) => ({ signup, event: rows[0] }));
    })
    .then(({ signup, event }) => {
      if (!event) return res.status(201).send({ signup });

    })
    .catch(next);
}

function getSignups(req, res, next) {
  selectSignups(req.params.id)
    .then((signups) => res.status(200).send({ signups }))
    .catch(next);
}

function addEventToMyCalendar(req,res,next) {
    const eventId = req.params.id;
    const userId = req.user.id;

    findTokensByUserId(userId)
    .then((tokens) => {
      if (!tokens) {
        const err = new Error("Google not connected");
        err.status = 400;
        throw err;
      }
      return db
        .query(
          `SELECT title, description, start_time, end_time, location
           FROM events
           WHERE id = $1`,
          [eventId]
        )
        .then(({ rows }) => {
          const event = rows[0];
          if (!event) {
            const err = new Error("Event not found");
            err.status = 404;
            throw err;
          }

          const calEvent = {
            summary: event.title,
            description: event.description || "",
            location: event.location || "",
            start: { dateTime: new Date(event.start_time).toISOString() },
            end:   { dateTime: new Date(event.end_time).toISOString() },
          };
          return addEventToCalendar(tokens, calEvent);
        });
    })
    .then((inserted) => {
      res.status(201).send({ calendar: inserted });
    })
    .catch(next);


  }



//auth
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByEmail, createUser } = require("../models/model");

const { JWT_SECRET = "superlongrandomsecretdontcommit", JWT_EXPIRES_IN = "7d" } = process.env;

function signToken(user) {
  const payload = {
    sub: user.id,         
    email: user.email,
    is_staff: user.is_staff
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

//register
function register(req, res, next) {
  const { email, name, password, is_staff } = req.body;

  if (!email || !name || !password) {
    return res.status(400).send({ msg: "email, name, and password are required" });
  }

  // Ensure email not taken
  findUserByEmail(email)
    .then((existing) => {
      if (existing) {
        const err = new Error("Email already registered");
        err.status = 409;
        throw err;
      }
      // Hash password
      return bcrypt.hash(password, 10);
    })
    .then((password_hash) =>
      // Create user
      createUser({ email, name, is_staff: !!is_staff, password_hash })
    )
    .then((user) => {
      // Sign token and respond
      const token = signToken(user);
      res.status(201).send({ user, token });
    })
    .catch(next);
}

// login
function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ msg: "email and password are required" });
  }

  let userRow;

  // Get user by email
  findUserByEmail(email)
    .then((user) => {
      if (!user) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
      }
      userRow = user;
      //Compare password
      return bcrypt.compare(password, user.password_hash);
    })
    .then((ok) => {
      if (!ok) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
      }
      //Sign token and respond
      const { password_hash, ...userSafe } = userRow;
      const token = signToken(userSafe);
      res.status(200).send({ user: userSafe, token });
    })
    .catch(next);
}

// google/init
// Requires auth
function initGoogle(req, res) {
  // req.user set by requireAuth
  const { eventId, next } = req.query;   

  const state = signOAuthState(req.user, {
    eventId: eventId ? Number(eventId) : undefined,
    next: next || undefined,
  });  
  const url = generateAuthUrl(state);
 
  res.status(200).send({ authUrl: url });
}

// google/callback?code=...
function googleCallback(req, res, next) {
  const {code, state} = req.query;
  if (!code || !state) return res.status(400).send({ msg: "Missing code/state" });

  let payload;
  try {
    payload = verifyOAuthState(state); // { purpose, sub, eventId?, next? }
  } catch {
    return res.status(400).send({ msg: "Invalid state" });
  }

  const userId   = payload.sub;
  const eventId  = payload.eventId ? Number(payload.eventId) : null;
  const nextPath = payload.next || "/integrations/google/success";

  const client = createOAuthClient();

  client.getToken(code)
    // store tokens, then forward the raw tokens
    .then(({ tokens }) => upsertTokens(userId, tokens).then(() => tokens))
    // if eventId present, add it to calendar right now
    .then((tokens) => {
      if (!eventId) return null;

      return db.query(
        `SELECT title, description, start_time, end_time, location
         FROM events WHERE id = $1`,
        [eventId]
      )
      .then(({ rows }) => rows[0] || null)
      .then((event) => {
        if (!event) return null;
        const calEvent = {
          summary: event.title,
          description: event.description || "",
          location: event.location || "",
          start: { dateTime: new Date(event.start_time).toISOString() },
          end:   { dateTime: new Date(event.end_time).toISOString() },
        };
        return addEventToCalendar(tokens, calEvent)
          .catch((e) => {
            console.error("Calendar insert after OAuth failed:", e.message);
            return null;
          });
      });
    })
    .then(() => {
      res.redirect(`${FRONTEND_BASE_URL}${nextPath}${nextPath.includes("?") ? "&" : "?"}calendar=added`);
    })
    .catch(next);
}

function listEvents(req, res, next) {
  const { q, category, location, start, end, page = 1, include } = req.query;

  const where = [];
  const params = [];
  let i = 1;

  if (q) {
    where.push(`(title ILIKE $${i} OR description ILIKE $${i} OR location ILIKE $${i})`);
    params.push(`%${q}%`); i++;
  }
  if (category) {
    where.push(`category = $${i}`); params.push(category.toUpperCase()); i++;
  }
  if (location) {
    where.push(`location ILIKE $${i}`); params.push(`%${location}%`); i++;
  }
  if (start) {
    where.push(`start_time >= $${i}`); params.push(new Date(start)); i++;
  }
  if (end) {
    where.push(`end_time <= $${i}`); params.push(new Date(end)); i++;
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limit = Math.min(Number(req.query.limit) || 12, 200);
  const offset = (Math.max(1, Number(page)) - 1) * limit;

  const baseSql = `
    SELECT e.*
    ${include === "counts" ? `,
      (SELECT COUNT(*)::INT FROM signups s WHERE s.event_id = e.id) AS signup_count` : ""}
    FROM events e
    ${clause}
    ORDER BY start_time ASC
    LIMIT ${limit} OFFSET ${offset};
  `;

  db.query(baseSql, params)
    .then(({ rows }) => res.send({ events: rows, page: Number(page) }))
    .catch(next);
};

function googleStatus(req, res, next) {
  const userId = req.user.id;
  findTokensByUserId(userId)
    .then((tokens) => {
      const connected = !!(tokens && (tokens.refresh_token || tokens.access_token));
      res.status(200).send({ connected });
    })
    .catch(next);
}


function listSignupIds(req, res, next) {
  return db
    .query(
      "SELECT event_id FROM signups WHERE user_id = $1 ORDER BY event_id ASC;",
      [req.user.id]
    )
    .then(({ rows }) => {
      res.status(200).send({ event_ids: rows.map((r) => r.event_id) });
    })
    .catch(next);
}


module.exports = {
  getHealth,
  getEvents,
  getEventById,
  postEvent,
  patchEvent,
  removeEvent,
  postSignup,
  getSignups,
  register,
  login,
  initGoogle,
  googleCallback,
  listEvents, 
  listSignupIds,
  addEventToMyCalendar,
  googleStatus
};
