const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// RUTAS API
// ===============================

app.use("/api/auth", require("./routes/auth"));
app.use("/api/incidencias", require("./routes/incidencias"));

// ===============================
// SERVIR FRONTEND (SI ESTÁ FUERA)
// ===============================

app.use(express.static(path.join(__dirname, "../")));

// ⚠️ ELIMINAMOS el app.get("*") que causaba el error

// ===============================
// SERVIDOR
// ===============================

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor funcionando en http://localhost:${PORT}`);
});
