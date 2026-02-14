const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Crear o conectar base de datos
const db = new sqlite3.Database("./incidencias.db");

// Crear tabla si no existe
db.serialize(() => {
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
// GET todas
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
// POST crear
// ==========================
app.post("/api/incidencias", (req, res) => {
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
});

// ==========================
// DELETE
// ==========================
app.delete("/api/incidencias/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM incidencias WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json({ mensaje: "Eliminada" });
  });
});

// ==========================
// PUT cambiar estado
// ==========================
app.put("/api/incidencias/:id/estado", (req, res) => {
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
});

app.listen(3000, () => {
  console.log("Servidor con SQLite en http://127.0.0.1:3000");
});