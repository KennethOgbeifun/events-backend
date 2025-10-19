const express = require("express");
const cors = require("cors");
const {
  register, login, listEvents, listSignupIds,
  getHealth, getEvents, getEventById, postEvent, patchEvent, removeEvent,
  postSignup, getSignups, initGoogle, googleCallback
} = require("./controllers/controller");
const { requireAuth, requireStaff } = require("./utils/auth");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_BASE_URL || "http://localhost:5173" }));
app.use(express.json());

// health
app.get("/api/health", getHealth);

// auth
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);

// events
app.get("/api/events", listEvents);
app.get("/api/events/:id", getEventById);
app.post("/api/events", requireAuth, requireStaff, postEvent);
app.patch("/api/events/:id", requireAuth, requireStaff, patchEvent);
app.delete("/api/events/:id", requireAuth, requireStaff, removeEvent);

// signups
app.post("/api/events/:id/signups", requireAuth, postSignup);
app.get("/api/events/:id/signups", requireAuth, requireStaff, getSignups);


app.get("/api/signups/me", requireAuth, listSignupIds);

// Google OAuth
app.get("/api/integrations/google/init", requireAuth, initGoogle);
app.get("/api/integrations/google/callback", googleCallback);

// 404
app.use((req, res) => {
  res.status(404).send({ msg: "Route not found" });
});


app.use((err, req, res, next) => {
  if (err.status) return res.status(err.status).send({ msg: err.message });

  switch (err.code) {
    case "22P02": // invalid_text_representation (e.g., non-number id)
      return res.status(400).send({ msg: "Bad request: invalid parameter" });
    case "23502": // not_null_violation
      return res.status(400).send({ msg: "Bad request: missing required field" });
    case "23503": // foreign_key_violation
      return res.status(404).send({ msg: "Related resource not found" });
    case "23505": // unique_violation (e.g., duplicate email)
      return res.status(409).send({ msg: "Conflict: resource already exists" });
    default:
      break;
  }

  next(err);
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    if (process.env.NODE_ENV === "development") {
      console.error(err);
    } else {
      console.error(err.message);
    }
  }
  res.status(500).send({ msg: "Internal Server Error" });
});


module.exports = app;
