const asyncHandler = require("express-async-handler");
const User = require("../modelos/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler (async (req, res, next) => {
	try{
		const token = req.cookies.dirinfraBiblioteca;

		if(!token) {
			res.status(401)
			throw new Error("Não autorizado, por favor faça login!")
		}

		const verificado = jwt.verify(token, process.env.JWT_SECRET);

		//Get user id do token
		const user = await User.findById(verificado.id).select("-senha")

		if(!user) {
			res.status(401)
			throw new Error("Usuário não encontrado!")
		}
		req.user = user
		next()
	} catch (error) {
		res.status(401)
		throw new Error("Não autorizado, por favor faça login!")
	}
})

module.exports = protect