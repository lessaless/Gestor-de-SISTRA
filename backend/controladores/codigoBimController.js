const asyncHandler = require("express-async-handler");
const CodigoBim = require("../modelos/codigoBimModel");
const tratarErrosModel = require("../utils/tratamentoErrosMDB/tratamentoErrosMDB");



const lerCodigosBim = asyncHandler(async (req, res) => {
	try {
		const { id_demanda } = req.query;
		const filtro = id_demanda ? { id_demanda } : {}; // Se id_demanda estiver definido, use-o no filtro, caso contrário, busque todas os CNs
		const codigosbim = await CodigoBim.find(filtro);
		return res.status(200).json(codigosbim);
	} catch (erro) {
		console.error(erro);
		res.status(500);
		throw new Error("Erro interno do servidor ao buscar Codigos Bim.");
	}
});

module.exports = {
	lerCodigosBim,
}