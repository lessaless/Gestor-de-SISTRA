const asyncHandler = require("express-async-handler");
const User = require("../modelos/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {


  try {

    const saram = process.env.DEV_SARAM;

    if (!saram) {
      const error = new Error(`DEV_SARAM não definido no .env`);
      res.status(404);
      throw error;
    }

    const user = await User.findOne({ SARAM: saram }).select("-senha");


    if (!user) {
      const error = new Error(`Usuário não encontrado para o SARAM: ${saram} (definido em DEV_SARAM no .env)`);
      res.status(404);
      throw error;
    }

    req.user = user;
    next();

  } catch (error) {
    res.status(401);
    throw new Error(error.message || "Não autorizado! Por favor, faça login!");

  }
});

module.exports = protect;
