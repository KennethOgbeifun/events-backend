const { google } = require("googleapis");
const jwt = require("jsonwebtoken");


const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  JWT_EXPIRES_IN,
  JWT_SECRET
} = process.env;



// Scopes: calendar events read/write
const CAL_SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

function createOAuthClient() {
  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );
  return oAuth2Client;
}

// build a consent URL for the user to visit
function generateAuthUrl(state) {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",     
    prompt: "consent",          
    scope: CAL_SCOPES,
    state,
  });
}

// auth state

function signOAuthState(user, patch = {}) {

  const payload = {
    purpose: "google_oauth",
    sub: user.id,             // who is authenticating
    ...patch,                 // add eventId, next, action, etc.
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify the state token and return payload (contains sub = user id)
function verifyOAuthState(state) {
  const payload = jwt.verify(state, JWT_SECRET);
  if (payload.purpose !== "google_oauth") throw new Error("Bad state");
  return payload;
}




module.exports = { signOAuthState, verifyOAuthState, createOAuthClient, generateAuthUrl, CAL_SCOPES };
