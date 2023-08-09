const express = require("express");
const router = express.Router();

// Middleware para abrir partes de la web solo a usuarios activos
const { updateLocals } = require("../middlewares/auth.middlewares.js");
router.use(updateLocals);

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

// Rutas en carpetas internas
const authRouter = require("./auth.routes.js");
router.use("/auth", authRouter);

const userRouter = require("./user.routes.js");
router.use("/user", userRouter);

module.exports = router;
