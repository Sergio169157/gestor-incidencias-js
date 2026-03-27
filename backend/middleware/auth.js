module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  // 🔴 SIN TOKEN
  if (!token) {
    return res.status(401).json({ msg: "No autorizado" });
  }

  // 🧪 SIMULACIÓN SIMPLE (puedes mejorar luego)
  if (token === "admin") {
    req.user = { usuario: "admin", rol: "admin" };
  } else {
    req.user = { usuario: "user", rol: "user" };
  }

  next();
};