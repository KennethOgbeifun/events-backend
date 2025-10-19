const db = require("../db/connection");

function selectEvents({ includeSignups = false } = {}) {
  if (!includeSignups) {
    return db.query(
      `SELECT id, title, description, start_time, end_time, location,
              price_type, price_pence, created_by, created_at, updated_at
       FROM events
       ORDER BY start_time ASC`
    ).then(({ rows }) => rows);
  }

  return db.query(
    `SELECT e.*,
            COUNT(s.id)::int AS signup_count
     FROM events e
     LEFT JOIN signups s ON s.event_id = e.id
     GROUP BY e.id
     ORDER BY e.start_time ASC`
  ).then(({ rows }) => rows);
}

function selectEventById(id) {
  return db
    .query(
      `SELECT e.*,
              json_build_object('id', u.id, 'name', u.name, 'email', u.email, 'is_staff', u.is_staff) AS created_by_user
       FROM events e
       LEFT JOIN users u ON u.id = e.created_by
       WHERE e.id = $1`,
      [id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        const err = new Error("Event not found");
        err.status = 404;
        throw err;
      }
      return rows[0];
    });
}

function insertEvent(body) {
  const {
    title,
    description,
    start_time,
    end_time,
    location,
    price_type,
    price_pence,
    created_by
  } = body;

  if (!title || !description || !start_time || !end_time || !location || !price_type) {
    const err = new Error("Missing required fields");
    err.status = 400;
    throw err;
  }
  if (!["FREE","FIXED","PAY_AS_YOU_FEEL"].includes(price_type)) {
    const err = new Error("Invalid price_type");
    err.status = 400;
    throw err;
  }
  if (price_type === "FIXED" && (typeof price_pence !== "number" || price_pence < 0)) {
    const err = new Error("price_pence required and must be >= 0 for FIXED");
    err.status = 400;
    throw err;
  }

  const sql = `
    INSERT INTO events
      (title, description, start_time, end_time, location, price_type, price_pence, created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`;
  const params = [
    title, description, start_time, end_time, location,
    price_type, price_type === "FIXED" ? price_pence : null,
    created_by || null
  ];

  return db.query(sql, params).then(({ rows }) => rows[0]);
}

function updateEvent(id, patch) {
  const allowed = ["title","description","start_time","end_time","location","price_type","price_pence"];
  const entries = Object.entries(patch).filter(([k]) => allowed.includes(k));
  if (entries.length === 0) {
    const err = new Error("No valid fields to update");
    err.status = 400;
    throw err;
  }

  const nextType = patch.price_type;
  if (nextType && !["FREE","FIXED","PAY_AS_YOU_FEEL"].includes(nextType)) {
    const err = new Error("Invalid price_type");
    err.status = 400;
    throw err;
  }
  if (nextType === "FIXED" && (typeof patch.price_pence !== "number" || patch.price_pence < 0)) {
    const err = new Error("price_pence required and must be >= 0 for FIXED");
    err.status = 400;
    throw err;
  }

  const set = entries.map(([k], i) => `${k} = $${i + 1}`).join(", ");
  const values = entries.map(([, v]) => v);

  return db.query(
    `UPDATE events SET ${set}, updated_at = now()
     WHERE id = $${values.length + 1}
     RETURNING *`,
    [...values, id]
  ).then(({ rows }) => {
    if (rows.length === 0) {
      const err = new Error("Event not found");
      err.status = 404;
      throw err;
    }
    return rows[0];
  });
}

function deleteEvent(id) {
  return db.query(`DELETE FROM events WHERE id = $1`, [id]).then(({ rowCount }) => {
    if (rowCount === 0) {
      const err = new Error("Event not found");
      err.status = 404;
      throw err;
    }
  });
}

function insertSignup(eventId, body) {
  const { user_id } = body;
  if (!user_id) {
    const err = new Error("user_id required");
    err.status = 400;
    throw err;
  }

  return db.query(
    `INSERT INTO signups (user_id, event_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, event_id) DO NOTHING
     RETURNING *`,
    [user_id, eventId]
  ).then(({ rows }) => rows[0] || { already_signed_up: true });
}

function selectSignups(eventId) {
  return db.query(
    `SELECT s.id, s.created_at,
            json_build_object('id', u.id, 'name', u.name, 'email', u.email) AS user
     FROM signups s
     JOIN users u ON u.id = s.user_id
     WHERE s.event_id = $1
     ORDER BY s.created_at DESC`,
    [eventId]
  ).then(({ rows }) => rows);
}



// auth

function findUserByEmail(email) {
  return db
    .query(
      `SELECT id, email, name, is_staff, password_hash
       FROM users
       WHERE email = $1`,
      [email]
    )
    .then(({ rows }) => rows[0] || null);
}

function createUser({ email, name, is_staff = false, password_hash }) {
  if (!email || !name || !password_hash) {
    const err = new Error("Missing required fields");
    err.status = 400;
    throw err;
  }
  return db
    .query(
      `INSERT INTO users (email, name, is_staff, password_hash)
       VALUES ($1,$2,$3,$4)
       RETURNING id, email, name, is_staff`,
      [email, name, !!is_staff, password_hash]
    )
    .then(({ rows }) => rows[0]);
}
 //google
function upsertTokens(userId, token) {
  const { access_token, refresh_token, scope, token_type, expiry_date } = token;
  return db.query(
    `INSERT INTO google_tokens (user_id, access_token, refresh_token, scope, token_type, expiry_date)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (user_id)
     DO UPDATE SET
       access_token = EXCLUDED.access_token,
       refresh_token = COALESCE(EXCLUDED.refresh_token, google_tokens.refresh_token),
       scope = EXCLUDED.scope,
       token_type = EXCLUDED.token_type,
       expiry_date = EXCLUDED.expiry_date
     RETURNING *;`,
    [userId, access_token || null, refresh_token || null, scope || null, token_type || null, expiry_date || null]
  ).then(({ rows }) => rows[0]);
}

function findTokensByUserId(userId) {
  return db.query(
    `SELECT user_id, access_token, refresh_token, scope, token_type, expiry_date
     FROM google_tokens
     WHERE user_id = $1`,
    [userId]
  ).then(({ rows }) => rows[0] || null);
}



module.exports = {
  selectEvents,
  selectEventById,
  insertEvent,
  updateEvent,
  deleteEvent,
  insertSignup,
  selectSignups,
  findUserByEmail,
  createUser,
  upsertTokens,
  findTokensByUserId
};
