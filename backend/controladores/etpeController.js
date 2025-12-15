const asyncHandler = require("express-async-handler");
const ETPE = require("../modelos/etpeModel");
const tratarErrosModel = require("../utils/tratamentoErrosMDB/tratamentoErrosMDB");



const lerETPEs = asyncHandler(async (req, res) => {
	try {
		const { id_demanda } = req.query;
		const filtro = id_demanda ? { id_demanda } : {}; // Se id_demanda estiver definido, use-o no filtro, caso contrário, busque todas os ETPEs
		const etpes = await ETPE.find(filtro);
		return res.status(200).json(etpes);
	} catch (erro) {
		console.error(erro);
		res.status(500);
		throw new Error("Erro interno do servidor ao buscar ETPEs.");
	}
});

const buscarSolucoesPorETPE = asyncHandler(async (req, res) => {
	try {
		
		const { id_etpe } = req.query;

		
		// Se o id_etpe não estiver definido, retorna uma lista vazia
		if (!id_etpe) {
			return res.status(200).json([]);
		}
		console.log("id_etpe que chegou no buscarSolucoesPorETPE do backend", id_etpe)

		// Encontra o ETPE pelo id_etpe
		const etpe = await ETPE.findOne({ id_etpe });
		console.log("etpe encontrado na função buscarSolucoesPorETPE do backend", etpe)



		// Verifica se o ETPE foi encontrado
		if (!etpe) {
			return res.status(404).json({ message: "ETPE não encontrado" });
		}

		// Verifica se o ETPE possui soluções
		if (!etpe.solucoes) {
			return res.status(404).json({ message: "Não foram encontradas soluções para o ETPE selecionado" });
		}

		// Extrai a lista de soluções
		const solucoes = etpe.solucoes.map(solucao => ({
			nume_solucao: solucao.nume_solucao
		}));

		console.log("soluções encontradas no backend", solucoes)

		// Retorna a lista de soluções
		return res.status(200).json(solucoes);
	} catch (erro) {
		console.error(erro);
		res.status(500);
		throw new Error("Erro interno do servidor ao buscar as soluções do ETPE.");
	}
});

module.exports = {
	lerETPEs,
	buscarSolucoesPorETPE,
}