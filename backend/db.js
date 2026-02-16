const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");

const db = new sqlite3.Database("./database.db");

db.serialize(() => {

  // ===============================
  // TABLA USUARIOS
  // ===============================
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      rol TEXT DEFAULT 'user'
    )
  `);

  // ===============================
  // TABLA INCIDENCIAS
  // ===============================
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

  // ===============================
  // CREAR ADMIN SI NO EXISTE
  // ===============================
  db.get("SELECT * FROM usuarios WHERE username = ?", ["admin"], async (err, row) => {

    if (err) {
      console.error(err);
      return;
    }

    if (!row) {
      const hash = await bcrypt.hash("1234", 10);

      db.run(
        "INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)",
        ["admin", hash, "admin"],
        (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log("Usuario admin creado: admin / 1234");
          }
        }
      );
    }

  });

  console.log("Tablas verificadas / creadas correctamente");
});

module.exports = db;