// middleware (para asegurarnos de que el usuario tiene sesion activa)
// son funciones que hay que pasarlas como callback como segundo argumento
// cuando el usuario vaya a esta ruta, primera ejecuta el middleware, si esta funcion te dice que puedes continuar, entonces ves a la ruta
function isLoggedIn(req, res, next) {
  if (req.session.user === undefined) {
    res.redirect("/");
  } else {
    // adelante sigue con la ruta
    next(); //sin ningun valor interno, significa continua con las rutas
  }
}

function updateLocals(req, res, next) {
  if (req.session.user === undefined) {
    // creo una variable local que indique si el usuario está logeado o no
    res.locals.isUserActive = false;
  } else {
    // que está logeado
    res.locals.isUserActive = true;
  }
  next(); // despues de actualizar las variables continua con las rutas
}

module.exports = {
  isLoggedIn: isLoggedIn,
  updateLocals: updateLocals,
};
