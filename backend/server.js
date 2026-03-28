const express = require("express");

const app = express();

app.use(express.json());

// ==========================
// CONFIG
// ==========================
const PORT = process.env.PORT || 3000;
const TOKEN = "123456";

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
    return res.json({
      token: TOKEN,
      user: {
        usuario: "Sergiito24",
        rol: "admin"
      }
    });
  }

  res.status(401).json({ error: "Credenciales incorrectas" });
});

// ==========================
// MIDDLEWARE AUTH
// ==========================
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || auth !== `Bearer ${TOKEN}`) {
    return res.status(401).json({ error: "Token inválido" });
  }

  next();
}

// ==========================
// INCIDENCIAS (MEMORIA)
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

// GET TODAS
app.get("/api/incidencias", authMiddleware, (req, res) => {
  res.json(incidencias);
});

// CREAR
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

  console.log("📥 Nueva incidencia:", nueva);

  res.json(nueva);
});

// ==========================
// ACTUALIZAR ESTADO (PUT)
// ==========================
app.put("/api/incidencias/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);
  const { estado } = req.body;

  const incidencia = incidencias.find(i => i.id === id);

  if (!incidencia) {
    return res.status(404).json({ error: "Incidencia no encontrada" });
  }

  if (!estado) {
    return res.status(400).json({ error: "Falta estado" });
  }

  incidencia.estado = estado;

  console.log("🔄 Incidencia actualizada:", incidencia);

  res.json(incidencia);
});

// ==========================
// ELIMINAR (DELETE)
// ==========================
app.delete("/api/incidencias/:id", authMiddleware, (req, res) => {
  const id = Number(req.params.id);

  const index = incidencias.findIndex(i => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Incidencia no encontrada" });
  }

  const eliminada = incidencias.splice(index, 1);

  console.log("🗑️ Incidencia eliminada:", eliminada[0]);

  res.json({ message: "Incidencia eliminada" });
});

// ==========================
// SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`🔥 SERVIDOR OK en puerto ${PORT} 🔥`);
});