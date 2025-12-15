const asyncHandler = require("express-async-handler");
const User = require("../modelos/userModel");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logs/logger");

const protectAdmin = (options = {}) => asyncHandler(async (req, res, next) => {

	//se true, apenas verifica e bloqueia mas não lança erro para o cliente
    const soVerificar = options.soVerificar || false;

	try{
		
		
		const user = req.user;

		if(!user) {
			if (soVerificar) return res.status(200).json({ eAdmin: false });
			res.status(401)
			throw new Error("Usuário não encontrado!")

		}

		const id = user._id;
		const isAdmin = (await User.findById(id)).isAdmin;

		if(!isAdmin){
			if (soVerificar) return res.status(200).json({ eAdmin: false });
			logger.error(`Usuário ${user.SARAM} tentou acessar rota de administrador sem permissão (${req.path}).`);
			res.status(403)
			throw new Error("Não autorizado! É necessário privilégios de administrador.")

		}

		req.user = user
		
		next()
		
	} catch (error) {
		if (soVerificar) return res.status(200).json({ eAdmin: false });
		throw new Error(error)

	}
})

module.exports = protectAdmin