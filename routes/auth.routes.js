const express = require("express");
const router = express.Router();

// necesito llamar a bcrypt
const bcrypt = require("bcrypt");

// el modelo y esquema de User en Mongoo
const User = require("../models/User.model.js");

// rutas
// GET "/auth/signup" >> renderiza la vista del formulario para registrarse en la web
router.get("/signup", (req, res, next) => {
  res.render("./auth/signup.hbs");
});

// POST "/auth/signup" >> proceso de guardar los datos en la base de datos
router.post("/signup", async (req, res, next) => {
  // antes del try...catch tenemos que hacer las validaciones de la data

  const { username, email, password } = req.body;
  if (username === "" || email === "" || password === "") {
    res.status(400).render("./auth/signup.hbs", {
      errorMessage: "Todos los campos deben estar llenos",
      previousEmail: req.body.email,
      previousPassword: req.body.password,
      previousUsername: req.body.username,
    });
    return; // detiene la ejecucion de la ruta
  }

  // para hacer las validaciones complejas sobre strings se usa regex
  const regexPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  if (regexPassword.test(password) === false) {
    res.status(400).render("./auth/signup.hbs", {
      errorMessage:
        "La contraseña debe tener al menos 1 mayúscula, 1 minúscula, 1 carácter especial y tener 8 carácteres o más.",
      previousEmail: req.body.email,
      previousPassword: req.body.password,
      previousUsername: req.body.username,
    });
    return; // detiene la ejecucion de la ruta
  }

  try {
    const foundUser = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });
    console.log(foundUser);
    if (foundUser !== null) {
      res.status(400).render("./auth/signup.hbs", {
        errorMessage:
          "Ya existe un usuario con ese nombre de usuario o correo electrónico",
        previousEmail: req.body.email,
        previousPassword: req.body.password,
        previousUsername: req.body.username,
      });
      return; // detiene la ejecucion de la ruta
    }
    // aqui ciframos la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log(passwordHash);

    await User.create({
      username: username,
      email: email,
      password: passwordHash,
    });

    // lo ultimo que ocurrirácuando se ejecute todo será un res.redirect a la pagina de login
    res.redirect("/auth/login");
  } catch (error) {
    next(error);
  }
});

// GET "/auth/login" => renderiza al usuario un formulario de acceso
router.get("/login", (req, res, next) => {
  res.render("./auth/login.hbs");
});

// POST "/auth/login" => recibe las credenciales del usuario y los valida/autenticarlos
router.post("/login", async (req, res, next) => {
  console.log(req.body);
  const { email, password } = req.body;
  try {
    const foundUser = await User.findOne({ email: email });
    console.log(foundUser);

    if (foundUser === null) {
      res.status(400).render("./auth/login.hbs", {
        errorMessage: "El usuario no existe con ese Correo electrónico",
        previousEmail: req.body.email,
        previousPassword: req.body.password,
      });
      return;
    }

    // verificacion contraseña. Necesitamos lo que el usuario escribe en el formulario y necesitamos la contraseña cifrada de la base de datos. la contraseña cigrada es foundUser.password

    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.password
    );
    console.log(isPasswordCorrect);
    if (isPasswordCorrect === false) {
      res.status(400).render("./auth/login.hbs", {
        errorMessage: "Contraseña no válida",
        previousEmail: req.body.email,
        previousPassword: req.body.password,
      });
      return;
    }

    // aqui ya hemos autenticado al usuario => abrimos una sesion del usuario
    // esto es denso
    //con la configuracion que hemos hecho ya podemos crear sesiones y buscar sesiones

    // crear una sesion activa del usuario
    req.session.user = {
      _id: foundUser._id,
      email: foundUser.email,
    };

    // usualmente guardamos en la sesion informacion del usuario que no deberia cambiar, id siempre será el mismo, el correo no debería cambiar

    // el metodo save se invoca para esperar que se crea la sesion antes de hacer lo siguiente (es un metodo de callbacks)

    req.session.save(() => {
      // si todo va bien
      res.redirect("/user");
      // DESPUES DE CREAR LA SESION. TENEMOS ACCESO A REQ.SESSION.USER EN CUALQUIER RUTA DE MI SERVIDOR
    });
  } catch (error) {
    next(error);
  }
});

// GET "/auth/logout" => esta ruta permite al usuario cerrar la sesion activa
router.get("/logout", (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
