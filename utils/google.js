const { google } = require("googleapis");

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
} = process.env;
const { JWT_SECRET = "superlongrandomsecretdontcommit" } = process.env;

const jwt = require("jsonwebtoken");


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

function signOAuthState(user) {
  return jwt.sign(
    { sub: user.id, purpose: "google_oauth" },
    JWT_SECRET,
    { expiresIn: "10m" } 
  );
}

// Verify the state token and return payload (contains sub = user id)
function verifyOAuthState(state) {
  const payload = jwt.verify(state, JWT_SECRET);
  if (payload.purpose !== "google_oauth") throw new Error("Bad state");
  return payload;
}




module.exports = { signOAuthState, verifyOAuthState, createOAuthClient, generateAuthUrl, CAL_SCOPES };
