const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");

// LOGIN SIMPLE (sin bcrypt)
router.post("/login", (req, res) => {
  try {
    const { usuario, password } = req.body || {};

    if (!usuario || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    if (usuario !== "Sergiito24") {
      return res.status(401).json({ error: "Usuario incorrecto" });
    }

    if (password !== "1234") {
      return res.status(401).json({ error: "Password incorrecta" });
    }

    const token = jwt.sign(
      {
        id: 1,
        usuario: "Sergiito24",
        rol: "admin"
      },
      "supersecreto123",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        usuario: "Sergiito24",
        rol: "admin"
      }
    });

  } catch (error) {
    console.error("ERROR LOGIN:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

module.exports = router;