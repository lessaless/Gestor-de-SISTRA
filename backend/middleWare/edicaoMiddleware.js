const asyncHandler = require("express-async-handler");
const User = require("../modelos/userModel");
const jwt = require("jsonwebtoken");

const protectEdicao = asyncHandler(async (req, res, next) => {
	try {
		//console.log("Entrou em protectEdicao")
		const user = req.user;
		if (!user) {
			res.status(401);
			throw new Error("Usuário não encontrado!");
		}

		const hasEdicaoPermission = user.permissoesBiblioteca.some(permissao =>
			permissao.includes("edicao")
		);

		if (!hasEdicaoPermission) {
			res.status(403);
			throw new Error("Usuário não autorizado a editar documentos. Entre em contato se achar que isso é um erro.");
		}

		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
});

module.exports = protectEdicao;
