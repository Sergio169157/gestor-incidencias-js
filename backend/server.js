const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const { body, validationResult, param } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "super_clave_secreta";

// ==========================
// Base de datos
// ==========================

const db = new sqlite3.Database("./incidencias.db");

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS incidencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      prioridad TEXT NOT NULL,
      estado TEXT NOT NULL,
      fecha INTEGER NOT NULL
    )
  `);
});

// ==========================
// Middleware JWT
// ==========================

function verificarToken(req, res, next) {

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Token requerido" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido" });
    }

    req.user = user;
    next();
  });
}

// ==========================
// Registro
// ==========================

app.post(
  "/api/register",

  body("username").notEmpty(),
  body("password").isLength({ min: 4 }),

  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO usuarios (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      function (err) {
        if (err) {
          return res.status(400).json({ error: "Usuario ya existe" });
        }

        res.status(201).json({ mensaje: "Usuario creado" });
      }
    );
  }
);

// ==========================
// Login
// ==========================

app.post("/api/login", async (req, res) => {

  const { username, password } = req.body;

  db.get(
    "SELECT * FROM usuarios WHERE username = ?",
    [username],
    async (err, user) => {

      if (err || !user) {
        return res.status(400).json({ error: "Credenciales incorrectas" });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(400).json({ error: "Credenciales incorrectas" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.json({ token });
    }
  );
});

// ==========================
// GET incidencias
// ==========================

app.get("/api/incidencias", (req, res) => {
  db.all("SELECT * FROM incidencias ORDER BY fecha DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// ==========================
// POST crear incidencia
// ==========================

app.post(
  "/api/incidencias",

  body("titulo").notEmpty(),
  body("descripcion").notEmpty(),
  body("prioridad").isIn(["baja", "media", "alta"]),

  (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    const { titulo, descripcion, prioridad } = req.body;
    const fecha = Date.now();

    db.run(
      `INSERT INTO incidencias (titulo, descripcion, prioridad, estado, fecha)
       VALUES (?, ?, ?, ?, ?)`,
      [titulo, descripcion, prioridad, "pendiente", fecha],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
          id: this.lastID,
          titulo,
          descripcion,
          prioridad,
          estado: "pendiente",
          fecha
        });
      }
    );
  }
);

// ==========================
// DELETE (PROTEGIDO)
// ==========================

app.delete(
  "/api/incidencias/:id",
  verificarToken,
  param("id").isInt(),

  (req, res) => {

    const id = req.params.id;

    db.run("DELETE FROM incidencias WHERE id = ?", [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "No encontrada" });
      }

      res.json({ mensaje: "Eliminada correctamente" });
    });
  }
);

// ==========================
// PUT cambiar estado (PROTEGIDO)
// ==========================

app.put(
  "/api/incidencias/:id/estado",
  verificarToken,
  param("id").isInt(),

  (req, res) => {

    const id = req.params.id;

    db.get("SELECT estado FROM incidencias WHERE id = ?", [id], (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: "No encontrada" });
      }

      const flujo = {
        pendiente: "en-proceso",
        "en-proceso": "resuelta",
        resuelta: "pendiente"
      };

      const nuevoEstado = flujo[row.estado];

      db.run(
        "UPDATE incidencias SET estado = ? WHERE id = ?",
        [nuevoEstado, id],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          res.json({ id, estado: nuevoEstado });
        }
      );
    });
  }
);

// ==========================
// Servidor
// ==========================

app.listen(3000, () => {
  console.log("Servidor con autenticación en http://127.0.0.1:3000");
});