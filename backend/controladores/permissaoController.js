const asyncHandler = require("express-async-handler");
const logger = require("../utils/logs/logger");

const User = require("../modelos/userModel");
const Role = require("../modelos/roleModel");
const Dados_pessoais = require("../modelos/dados_pessoaisModel");


////////////////////////////////////////////////////////////////////////////////////////////////////////////
const alterarPermissao = asyncHandler(async (req, res) => {
	
	const { pessoa, acao } = req.body;
	const autor = await Dados_pessoais.findOne({ SARAM: req.user.SARAM });

	if (!autor) {
		res.status(400);
		throw new Error("Usuário da requisição não encontrado!");
	}

	if (!pessoa || !pessoa.SARAM || !acao) {
		res.status(400);
		throw new Error("Dados inválidos. Certifique-se de enviar 'pessoa' com 'SARAM' e 'acao'.");
	}

	if (pessoa.SARAM === autor.SARAM) {
		res.status(400);
		throw new Error("Você não pode alterar suas próprias permissões.");
	}
	
	const usuario = await User.findOne({ SARAM: pessoa.SARAM });
	if (!usuario) {
		res.status(404);
		throw new Error("Usuário não encontrado.");
	}

	let novaRole;
	if (acao === "setaradmin") {
		novaRole = await Role.findOne({ _id: "admin_local" });
	} else if (acao === "removeradmin") {
		novaRole = await Role.findOne({ _id: "usuario_local" });
	} else {
		throw new Error("Ação inválida. Use 'setaradmin' ou 'removeradmin'.");
	}

	if (!novaRole) {
		throw new Error("Erro interno: role não encontrada.");
	}
	usuario.role = novaRole._id;
	await usuario.save({ validateModifiedOnly: true });

	logger.warn(`Permissão do usuário ${usuario.SARAM} alterada de ${pessoa.ACESSO} para ${novaRole._id} - Autor: ${autor.SARAM}/${autor.POSTO} ${autor.NOME}`);
	return res.status(200).json({ message: "Permissão alterada com sucesso." });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////
const obterUsuarios = asyncHandler(async (req, res) => {

	const user = req.user;

	const roleUsuario = await Role.findById(user.role);
	if (!roleUsuario) {
		res.status(404);
		throw new Error("Role do usuário não encontrada");
	}

	// Busca todos os roles com nível menor ou igual ao do usuário autenticado
	const rolesPermitidos = await Role.find({ nivel: { $lte: roleUsuario.nivel } });
	const rolesPermitidosIds = rolesPermitidos.map(r => r._id);

	// Filtro base para encontrar usuários com roles permitidos
	let filtroUsuarios = {
		$or: [
			{ role: { $in: rolesPermitidosIds } },
			{ role: { $exists: false } } // Inclui usuários sem role
		]
	};

	// Se o usuário autenticado for "admin_local", filtrar pelo OM correspondente
	if (user.role._id === "admin_local") {//só pode ser admin_local ou admin_geral (verificado no middleware)
		filtroUsuarios = {
			...filtroUsuarios,
			OM: user.OM
		};
	}

	// Buscar usuários
	const usuarios = await User.find(filtroUsuarios).select("SARAM role");
	const userSARAMs = usuarios.map(u => u.SARAM);// Obter os SARAMs dos usuários encontrados

	const dadosPessoais = await Dados_pessoais.find({ SARAM: { $in: userSARAMs } })// Buscar os dados pessoais dos usuários
		.select("SARAM NOME POSTO OM");

	// Mapa para acesso rápido aos dados pessoais
	const dadosMap = dadosPessoais.reduce((acc, dp) => {
		acc[dp.SARAM] = dp;
		return acc;
	}, {});

	// Resultado final
	const resultado = usuarios.map(user => ({
		/* _id: user._id, */
		SARAM: user.SARAM,
		NOME: dadosMap[user.SARAM]?.NOME || "Desconhecido",
		POSTO: dadosMap[user.SARAM]?.POSTO || "Desconhecido",
		OM: dadosMap[user.SARAM]?.OM || "Desconhecido",
		ACESSO: user.role,
	}));

	return res.status(200).json(resultado);
});

module.exports = {
	alterarPermissao,
	obterUsuarios
}
