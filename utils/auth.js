// auth
const jwt = require("jsonwebtoken");
const { JWT_SECRET = "superlongrandomsecretdontcommit" } = process.env;

// Bearer token and verifier
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const [scheme, token] = auth.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).send({ msg: "Missing or invalid Authorization header" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET); 
    req.user = {
      id: payload.sub,
      email: payload.email,
      is_staff: payload.is_staff
    };
    next();
  } catch (err) {
    return res.status(401).send({ msg: "Invalid or expired token" });
  }
}

// Staff-only 
function requireStaff(req, res, next) {
  if (!req.user?.is_staff) {
    return res.status(403).send({ msg: "Staff only" });
  }
  next();
}

module.exports = { requireAuth, requireStaff };
