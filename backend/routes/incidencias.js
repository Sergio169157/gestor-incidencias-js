const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

// DATOS FAKE (puedes cambiarlo luego por BD)
let incidencias = [
  { id: 1, titulo: "Error login", descripcion: "No funciona", estado: "pendiente", usuario: "anonimo" }
];


// =========================
// 🟢 CREAR (PUBLICO)
// =========================
router.post("/public", (req, res) => {
  const { titulo, descripcion } = req.body;

  const nueva = {
    id: Date.now(),
    titulo,
    descripcion,
    estado: "pendiente",
    usuario: "anonimo"
  };

  incidencias.push(nueva);

  res.json(nueva);
});


// =========================
// 🟢 VER PUBLICO
// =========================
router.get("/public", (req, res) => {
  res.json(incidencias);
});


// =========================
// 🔐 VER PRIVADO (logueado)
// =========================
router.get("/", authMiddleware, (req, res) => {
  res.json(incidencias);
});


// =========================
// 🔐 CAMBIAR ESTADO
// =========================
router.put("/:id", authMiddleware, (req, res) => {
  const { estado } = req.body;

  incidencias = incidencias.map(i =>
    i.id == req.params.id ? { ...i, estado } : i
  );

  res.json({ ok: true });
});


// =========================
// 🔥 BORRAR (SOLO ADMIN)
// =========================
router.delete("/:id", authMiddleware, (req, res) => {

  // 🔒 CONTROL DE ROL
  if (!req.user || req.user.rol !== "admin") {
    return res.status(403).json({ msg: "Solo admin puede eliminar" });
  }

  incidencias = incidencias.filter(i => i.id != req.params.id);

  res.json({ ok: true });
});


module.exports = router;