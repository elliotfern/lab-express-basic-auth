const express = require("express");
const router = express.Router();

const User = require("../models/User.model.js");

// funcion middlewares
const { isLoggedIn } = require("../middlewares/auth.middlewares.js");
// ejemplo de ruta privada
router.get("/", isLoggedIn, (req, res, next) => {
  // esta vista deberia ser privada
  // solo usuarios con usuario activa deberian entrar
  // en todas las rutas tengo acceso a la ruta activa
  console.log(req.session.user);
  // si fuera undefined, seria que el visitante no tiene una sesion activa

  //si es un objeto > el usuario está activo y ese usuario está haciendo las llamadas

  User.findById(req.session.user._id)
    .then((response) => {
      res.render("./auth/user-profile.hbs", {
        userDetails: response,
      });
    })
    .catch((error) => {
      next(error);
    });
});

module.exports = router;
