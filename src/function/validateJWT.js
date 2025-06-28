require("dotenv").config();
const jwt = require("jsonwebtoken");
const pool = require("../database/conection.js");
const JWT_SECRET = process.env.JWT_SECRET;

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await pool.execute(
      "SELECT * FROM token WHERE token = ? AND status = 'active'",
      [token]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: "Token inválido o expirado" });
    }

    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido" });
  }
}

module.exports = authenticateToken;