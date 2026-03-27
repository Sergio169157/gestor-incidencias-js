let usuarioDB = {
  id: 1,
  usuario: "Sergiito24",
  password: "$2b$10$7QJ8zYvVw8QmYp0JpXQ2eO3xWcQF9K3kYQp1W9b1V7uGZ8YwFhG6K",
  rol: "admin"
};

router.post("/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    if (usuario !== usuarioDB.usuario) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const coincide = await bcrypt.compare(password, usuarioDB.password);

    if (!coincide) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      {
        id: usuarioDB.id,
        usuario: usuarioDB.usuario,
        rol: usuarioDB.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        usuario: usuarioDB.usuario,
        rol: usuarioDB.rol
      }
    });

  } catch (error) {
    console.error("ERROR LOGIN:", error);
    res.status(500).json({ error: "Error interno" });
  }
});