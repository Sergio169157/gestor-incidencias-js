const express = require("express");
const router = express.Router();
const db = require("../db");
const verificarToken = require("../middleware/auth");

// ===============================
// OBTENER INCIDENCIAS
// ===============================
router.get("/", verificarToken, (req, res) => {

  db.all("SELECT * FROM incidencias ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al obtener incidencias" });
    }
    res.json(rows);
  });

});

// ===============================
// CREAR INCIDENCIA
// ===============================
router.post("/", verificarToken, (req, res) => {

  const { titulo, descripcion, prioridad } = req.body;

  if (!titulo || !descripcion) {
    return res.status(400).json({ message: "Título y descripción obligatorios" });
  }

  db.run(
    "INSERT INTO incidencias (titulo, descripcion, prioridad, estado, fecha) VALUES (?, ?, ?, 'Pendiente', datetime('now'))",
    [titulo, descripcion, prioridad],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error al crear incidencia" });
      }
      res.json({ message: "Incidencia creada correctamente" });
    }
  );

});

// ===============================
// ELIMINAR INCIDENCIA
// ===============================
router.delete("/:id", verificarToken, (req, res) => {

  const { id } = req.params;

  db.run("DELETE FROM incidencias WHERE id = ?", [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al eliminar incidencia" });
    }
    res.json({ message: "Incidencia eliminada correctamente" });
  });

});

// ===============================
// CAMBIAR ESTADO
// ===============================
router.put("/:id/estado", verificarToken, (req, res) => {

  const { id } = req.params;

  db.get("SELECT estado FROM incidencias WHERE id = ?", [id], (err, row) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error al buscar incidencia" });
    }

    if (!row) {
      return res.status(404).json({ message: "Incidencia no encontrada" });
    }

    let nuevoEstado;

    switch (row.estado) {
      case "Pendiente":
        nuevoEstado = "En proceso";
        break;
      case "En proceso":
        nuevoEstado = "Resuelta";
        break;
      default:
        nuevoEstado = "Pendiente";
    }

    db.run(
      "UPDATE incidencias SET estado = ? WHERE id = ?",
      [nuevoEstado, id],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Error al actualizar estado" });
        }

        res.json({ message: "Estado actualizado correctamente" });
      }
    );

  });

});

module.exports = router;
