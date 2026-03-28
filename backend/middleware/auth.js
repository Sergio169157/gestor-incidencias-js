const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 🔒 Comprobar cabecera
  if (!authHeader) {
    return res.status(401).json({ msg: "No autorizado" });
  }

  // Formato: Bearer TOKEN
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Token inválido" });
  }

  try {
    // 🔥 CLAVE: fallback para evitar errores
    const SECRET = process.env.JWT_SECRET || "supersecreto123";

    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    console.error("ERROR TOKEN:", error.message);
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
};