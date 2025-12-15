const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../modelos/userModel");
const Dados_pessoais = require("../modelos/dados_pessoaisModel");

const logger = require("../utils/logs/logger.js");

const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: '1d'
	});
};



const keycloakAuthMiddleware = asyncHandler(async (req, res, next) => {

	if (!req.kauth || !req.kauth.grant) {
		res.status(401);
		throw new Error("Usuário não autenticado no Keycloak!");
	}

	const cpf = req.kauth.grant.id_token.content.preferred_username
	const email = req.kauth.grant.id_token.content.email;

	//////////////////////////////////////////// Adicionando o login com CPF ou EMAIL
	let query = { $or: [] };

	if (cpf !== undefined && cpf !== null && cpf !== "") {
		query.$or.push({ cpf });
	}
	if (email !== undefined && email !== null && email !== "") {
		query.$or.push({ email: { $regex: new RegExp(`^${email}$`, "i") } });//regex para ignorar maiúsculas e minúsculas
	}

	let user = null;
	if (query.$or.length > 0) {
		user = await User.findOne(query).select("-senha");
	}//////////////////////////////////////////////////////////////////////////////

	const idToken = req.kauth.grant.id_token.token; // Obter o ID Token do Keycloak


	const rotaLivre =  ['/precadastro'].includes(req.path);

	if (!user && !rotaLivre) {
		const error = new Error(`Usuário não encontrado em nosso banco de dados. Por favor, faça o pré-cadastro em <a href="/precadastro">solicitar pré-cadastro</a>.`);
		error.code = "USER_NOT_FOUND";
		logger.error(`Usuário não encontrado para o login CPF: ${cpf} - E-mail: ${email}`);
		res.status(404);
		throw error;
	}

	// Caso o user não exista, mas está acessando /precadastro, permitir com req.user parcial
	if (!user && rotaLivre) {
		logger.info(`${req.method}: acesso a /precadastro com CPF: ${cpf} - E-mail: ${email}`);
		req.user = {
			cpf,
			email,
			status: "precadastro",
		};
		return next();
	}

	let OM = user.OM;

	if (!OM) {// Busca de Dados pessoais caso não exista em User
		let DP = await Dados_pessoais.findOne({ SARAM: user.SARAM }, 'OM');
		OM = DP?.OM;
	}

	user.OM = OM;


	// logger.info(`${req.method}: ${user.SARAM}/${user.nome}`);

	const token = generateToken(user._id);

	res.set('Authorization', `Bearer ${token}`);
	res.set('Access-Control-Expose-Headers', 'Authorization');

	// Armazenar o ID Token no cookie
	res.cookie("idToken", idToken, {
		path: "/",
		httpOnly: true,
		expires: new Date(Date.now() + 1000 * 86400),
		sameSite: "Strict",
		secure: true
	});

	req.user = user;
	next();
});

module.exports = keycloakAuthMiddleware;
