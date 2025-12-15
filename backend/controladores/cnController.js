const asyncHandler = require("express-async-handler");
const CN = require("../modelos/cnModel");
const tratarErrosModel = require("../utils/tratamentoErrosMDB/tratamentoErrosMDB");



const lerCNs = asyncHandler(async (req, res) => {
	try {
		const { id_demanda } = req.query;
		const filtro = id_demanda ? { id_demanda } : {}; // Se id_demanda estiver definido, use-o no filtro, caso contrário, busque todas os CNs
		const cns = await CN.find(filtro);
		return res.status(200).json(cns);
	} catch (erro) {
		console.error(erro);
		res.status(500);
		throw new Error("Erro interno do servidor ao buscar CNs.");
	}
});

module.exports = {
	lerCNs,
}