const { google } = require("googleapis");
const { createOAuthClient } = require("./google");

// tokens: { access_token, refresh_token, scope, token_type, expiry_date }
function getAuthedCalendar(tokens) {
  const client = createOAuthClient();
  client.setCredentials(tokens);
  return google.calendar({ version: "v3", auth: client });
}

/*
 Adds an event to the user's primary calendar.
 event = { summary, description, start: {dateTime}, end: {dateTime}, location, attendees: [{email}], ... }
 */
function addEventToCalendar(tokens, event) {
  const calendar = getAuthedCalendar(tokens);
  return calendar.events.insert({
    calendarId: "primary",
    requestBody: event
  }).then(res => res.data);
}

module.exports = { addEventToCalendar };
