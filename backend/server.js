require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

// ==========================
// CORS (FUNCIONA LOCAL + PRODUCCIÓN)
// ==========================
app.use(cors({
  origin: true,
  credentials: true
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
// LOGIN (JWT)
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
// DATOS EN MEMORIA
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
// RUTA PUBLICA
// ==========================
app.get("/api/incidencias/public", (req, res) => {
  res.json(incidencias);
});

// ==========================
// RUTAS PRIVADAS
// ==========================

// GET
app.get("/api/incidencias", authMiddleware, (req, res) => {
  res.json(incidencias);
});

// POST
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

// PUT
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

// DELETE (solo admin)
app.delete("/api/incidencias/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);

  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "No tienes permisos" });
  }

  incidencias = incidencias.filter(i => i.id !== id);

  res.json({ message: "Incidencia eliminada" });
});

// ==========================
// SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`🔥 SERVIDOR OK en puerto ${PORT} 🔥`);
});