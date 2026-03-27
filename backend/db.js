const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./database.db");

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      rol TEXT DEFAULT 'admin'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS incidencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      descripcion TEXT,
      prioridad TEXT,
      estado TEXT DEFAULT 'Pendiente',
      fecha TEXT
    )
  `);

  // Crear admin si no existe
  db.get("SELECT * FROM usuarios WHERE username = ?", ["admin"], async (err, row) => {
    if (!row) {
      const hash = await bcrypt.hash("1234", 10);
      db.run(
        "INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)",
        ["admin", hash, "admin"]
      );
      console.log("Usuario admin creado: admin / 1234");
    }
  });

  console.log("Tablas verificadas / creadas correctamente");
});

module.exports = db;