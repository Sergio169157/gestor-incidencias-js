const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_SECRET } = require("../config.js");

router.post("/login", (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Datos incompletos" });
  }

  db.get("SELECT * FROM usuarios WHERE username = ?", [username], async (err, user) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error interno" });
    }

    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const passwordValida = await bcrypt.compare(password, user.password);

    if (!passwordValida) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });

  });

});

module.exports = router;