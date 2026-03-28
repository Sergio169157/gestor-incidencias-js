require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

// 🔥 AÑADE ESTO (CLAVE)
app.use(cors({
  origin: ["http://127.0.0.1:5500", "http://localhost:5500"]
}));

app.use(express.json());

// ==========================
// CONFIG
// ==========================
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback123";

// ==========================
// TEST
// ==========================
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// ==========================
// LOGIN
// ==========================
app.post("/api/auth/login", (req, res) => {
  const { usuario, password } = req.body || {};

  if (usuario === "Sergiito24" && password === "1234") {

    const token = jwt.sign(
      {
        usuario: "Sergiito24",
        rol: "admin"
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      token,
      user: {
        usuario: "Sergiito24",
        rol: "admin"
      }
    });
  }

  res.status(401).json({ error: "Credenciales incorrectas" });
});

// ==========================
// MIDDLEWARE JWT
// ==========================
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

// ==========================
// DATOS
// ==========================
let incidencias = [
  {
    id: 1,
    titulo: "Error login",
    descripcion: "No funciona",
    estado: "pendiente"
  }
];

// ==========================
// PUBLICO
// ==========================
app.get("/api/incidencias/public", (req, res) => {
  res.json(incidencias);
});

// ==========================
// PRIVADO
// ==========================
app.get("/api/incidencias", authMiddleware, (req, res) => {
  res.json(incidencias);
});

app.post("/api/incidencias", authMiddleware, (req, res) => {
  const { titulo, descripcion } = req.body;

  if (!titulo || !descripcion) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const nueva = {
    id: Date.now(),
    titulo,
    descripcion,
    estado: "pendiente"
  };

  incidencias.push(nueva);

  res.json(nueva);
});

app.put("/api/incidencias/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body;

  const incidencia = incidencias.find(i => i.id === id);

  if (!incidencia) {
    return res.status(404).json({ error: "No encontrada" });
  }

  incidencia.estado = estado;

  res.json(incidencia);
});

app.delete("/api/incidencias/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);

  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "No tienes permisos" });
  }

  incidencias = incidencias.filter(i => i.id !== id);

  res.json({ message: "Eliminada" });
});

// ==========================
// SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`🔥 SERVIDOR OK en puerto ${PORT} 🔥`);
});