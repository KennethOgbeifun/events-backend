const db = require("../connection");
const bcrypt = require("bcrypt");

function seed(data) {
  const state = { usersByEmail: {}, eventsByTitle: {} };
  const nowMs = Date.now();

  return db
    .query(`DROP TABLE IF EXISTS signups;`)
    .then(() => db.query(`DROP TABLE IF EXISTS events;`))
    .then(() => db.query(`DROP TABLE IF EXISTS google_tokens;`)) 
    .then(() => db.query(`DROP TABLE IF EXISTS users;`))

    .then(() =>
      db.query(`
        CREATE TABLE users (
          id BIGSERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name  TEXT NOT NULL,
          is_staff BOOLEAN NOT NULL DEFAULT false,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          is_google_connected BOOLEAN NOT NULL DEFAULT false
        );
      `)
    )

    .then(() =>
      db.query(`
        CREATE TABLE google_tokens (
          user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          access_token  TEXT,
          refresh_token TEXT,
          scope         TEXT,
          token_type    TEXT,
          expiry_date   BIGINT
        );
      `)
    )

    .then(() =>
      db.query(`
        CREATE TABLE events (
          id BIGSERIAL PRIMARY KEY,
          title       TEXT NOT NULL,
          description TEXT NOT NULL,
          start_time  TIMESTAMPTZ NOT NULL,
          end_time    TIMESTAMPTZ NOT NULL,
          location    TEXT NOT NULL,
          price_type  TEXT NOT NULL CHECK (price_type IN ('FREE','FIXED','PAY_AS_YOU_FEEL')),
          price_pence INT,
          created_by  BIGINT REFERENCES users(id) ON DELETE SET NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
          category    TEXT
        );
      `)
    )

    .then(() =>
      db.query(`
        CREATE TABLE signups (
          id BIGSERIAL PRIMARY KEY,
          user_id  BIGINT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
          event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          UNIQUE (user_id, event_id)
        );
      `)
    )

    .then(() =>
      Promise.all(
        (data.users || []).map((u) =>
          bcrypt
            .hash(u.password || "password123", 10)
            .then((hash) =>
              db.query(
                `INSERT INTO users (email, name, is_staff, password_hash)
                 VALUES ($1,$2,$3,$4)
                 RETURNING *;`,
                [u.email, u.name, !!u.is_staff, hash]
              )
            )
            .then(({ rows }) => {
              state.usersByEmail[u.email] = rows[0];
            })
        )
      )
    )

    .then(() =>
      Promise.all(
        (data.events || []).map((ev) => {
          const creator = ev.created_by_email ? state.usersByEmail[ev.created_by_email] : null;

          const startMs = nowMs + ( (ev.startOffsetHours || 0) * 60 * 60 * 1000 );
          const endMs   = startMs + ( (ev.durationMinutes  || 60) * 60 * 1000 );

          const startIso = new Date(startMs).toISOString();
          const endIso   = new Date(endMs).toISOString();

          return db
            .query(
              `INSERT INTO events (
                 title, description, location, start_time, end_time,
                 price_type, price_pence, created_by, category
               )
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
               RETURNING *;`,
              [
                ev.title,
                ev.description,
                ev.location,
                startIso,
                endIso,
                ev.price_type || "FREE",
                ev.price_pence ?? null,
                creator ? creator.id : null,
                ev.category ? ev.category.toUpperCase() : null
              ]
            )
            .then(({ rows }) => {
              state.eventsByTitle[ev.title] = rows[0];
            });
        })
      )
    )

    .then(() =>
      Promise.all(
        (data.signups || []).map((su) => {
          const user  = state.usersByEmail[su.user_email];
          const event = state.eventsByTitle[su.event_title];
          if (!user || !event) return Promise.resolve();
          return db.query(
            `INSERT INTO signups (user_id, event_id)
             VALUES ($1, $2)
             ON CONFLICT (user_id, event_id) DO NOTHING;`,
            [user.id, event.id]
          );
        })
      )
    )
}

module.exports = seed;
