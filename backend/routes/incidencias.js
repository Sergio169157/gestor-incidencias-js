const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

// =========================
// 🗄️ BASE DE DATOS SIMULADA
// =========================
let incidencias = [
  {
    id: 1,
    titulo: "Error login",
    descripcion: "No funciona",
    estado: "pendiente",
    usuario: "anonimo"
  }
];

// =========================
// 🔐 CREAR INCIDENCIA
// =========================
router.post("/", authMiddleware, (req, res) => {
  try {
    const { titulo, descripcion } = req.body;

    if (!titulo || titulo.length < 3) {
      return res.status(400).json({ error: "Título inválido" });
    }

    if (!descripcion || descripcion.length < 3) {
      return res.status(400).json({ error: "Descripción inválida" });
    }

    const nueva = {
      id: Date.now(),
      titulo,
      descripcion,
      estado: "pendiente",
      usuario: req.user.usuario || "anonimo" // 🔥 evita undefined
    };

    incidencias.push(nueva);

    res.json(nueva);

  } catch (error) {
    console.error("ERROR CREAR:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

// =========================
// 🟢 VER PUBLICO
// =========================
router.get("/public", (req, res) => {
  res.json(incidencias);
});

// =========================
// 🔐 VER PRIVADO
// =========================
router.get("/", authMiddleware, (req, res) => {
  res.json(incidencias);
});

// =========================
// 🔐 CAMBIAR ESTADO
// =========================
router.put("/:id", authMiddleware, (req, res) => {
  try {
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: "Estado requerido" });
    }

    if (!["pendiente", "proceso", "resuelta"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    let encontrada = false;

    incidencias = incidencias.map(i => {
      if (i.id == req.params.id) {
        encontrada = true;
        return { ...i, estado };
      }
      return i;
    });

    if (!encontrada) {
      return res.status(404).json({ error: "Incidencia no encontrada" });
    }

    res.json({ ok: true });

  } catch (error) {
    console.error("ERROR UPDATE:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

// =========================
// 🔥 BORRAR (SOLO ADMIN)
// =========================
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    if (!req.user || req.user.rol !== "admin") {
      return res.status(403).json({ error: "Solo admin puede eliminar" });
    }

    const antes = incidencias.length;

    incidencias = incidencias.filter(i => i.id != req.params.id);

    if (incidencias.length === antes) {
      return res.status(404).json({ error: "Incidencia no encontrada" });
    }

    res.json({ ok: true });

  } catch (error) {
    console.error("ERROR DELETE:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;