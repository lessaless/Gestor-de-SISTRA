const asyncHandler = require("express-async-handler");
const STATUS = require("../modelos/statusModel");
const tratarErrosModel = require("../utils/tratamentoErrosMDB/tratamentoErrosMDB");



const lerStatus = asyncHandler(async (req, res) => {
	try {
		const { id_demanda } = req.query;
		const filtro = id_demanda ? { id_demanda } : {}; // Se id_demanda estiver definido, use-o no filtro, caso contrário, busque todas os CNs
		const status = await STATUS.find(filtro);
		return res.status(200).json(status);
	} catch (erro) {
		console.error(erro);
		res.status(500);
		throw new Error("Erro interno do servidor ao buscar STATUS.");
	}
});

module.exports = {
	lerStatus,
}