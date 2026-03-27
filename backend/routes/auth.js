const express = require("express");
const router = express.Router();

// LOGIN
router.post("/login", (req, res) => {
  const { usuario, password } = req.body;

  if (usuario === "admin" && password === "1234") {
    return res.json({
      token: "token_fake_123"
    });
  }

  res.status(401).json({
    error: "Credenciales incorrectas"
  });
});

module.exports = router;