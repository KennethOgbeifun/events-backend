Node/Express API with PostgreSQL (local dev DB) + JWT auth.
Google Calendar integration.
Prerequisites:
Node 18+
npm 9+
PostgreSQL 14+ running locally
1. Install: npm i
2. Enviroment: Create .env.development and .env.test and .env.production (do not commit).
example: 
.env.development
# Postgres
PGHOST=localhost
PGPORT=5432
PGUSER=your_pg_user
PGPASSWORD=your_pg_password
PGDATABASE=events_dev

# Server
PORT=4000
FRONTEND_BASE_URL=http://localhost:5173

# JWT
JWT_SECRET=dev_super_secret_change_me
JWT_EXPIRES_IN=7d

# Google OAuth (optional in dev)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:4000/api/integrations/google/callback

.env.test
PGHOST=localhost
PGPORT=5432
PGUSER=your_pg_user
PGPASSWORD=your_pg_password
PGDATABASE=events_test
PORT=4001
JWT_SECRET=test_secret
JWT_EXPIRES_IN=1d

3. Databases

4. Seed Dev Data: npm run seed-dev

5. Run the dev API: npm run dev

6. Tests: npm test (uses .env.test and the test database)

7. Production (summary)

Hosting: Render (web service)

DB: Supabase (use Transaction Pooler URI in DATABASE_URL, requires SSL)

Required envs on Render
NODE_ENV=production
DATABASE_URL=postgresql://...:6543/postgres
PORT=4000
FRONTEND_BASE_URL=https://<your-netlify-site>.netlify.app
JWT_SECRET, JWT_EXPIRES_IN
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
GOOGLE_REDIRECT_URI=https://<your-api>.onrender.com/api/integrations/google/callback

app.js - express app and routes
listen.js - server entry
connection.js - pg pool
run-seed.js - env and calls seed
seed.js - Drops, creates and inserts for tables
auth.js - JWT auth middleware
google.js - 0Auth logic
calendar.js - google calendar logic
__tests__ - jest and supertest tests

