const asyncHandler = require("express-async-handler");
const Demanda = require("../modelos/demandaModel");
const tratarErrosModel = require("../utils/tratamentoErrosMDB/tratamentoErrosMDB");
const CN = require("../modelos/cnModel");

const criarDemanda = asyncHandler(async (req, res) => {

	//req.user vem do authMiddleware
	const criado_por = req.user.SARAM;

	//seleciona pra não mandar tudo que vier
	const {
		codigo_demanda,
		NR_PLANINFRA,
		status,
		titulo_demanda,
		UNIDADE
	} = req.body;

	try {

		const demandaBson = await Demanda.create({
			codigo_demanda,
			criado_por,
			NR_PLANINFRA,
			status,
			titulo_demanda,
			UNIDADE
		})
		return res.status(201).json(demandaBson);

	} catch (erro) {
		res.status(500);
		throw new Error(tratarErrosModel(erro));
	}
})


const lerDemandas = asyncHandler(async (req, res) => {
	try {
		//console.log("entrou no lerDemandas do demandaController")
		const demandas = await Demanda.find(req.body.filtro);//se undefined, busca todas
		//console.log("Demandas obtidas na função lerDemandas do demandaController", demandas)
		return res.status(200).json(demandas);

	} catch (erro) {
		console.error(erro);
		res.status(500);
		throw new Error("Erro interno do servidor ao buscar demandas.");
	}
});

const lerPecasDemanda = asyncHandler(async (req, res) => {
	try {
		const pecas = await CN.find(req.query.filtro);//se undefined, busca todas
		return res.status(200).json(pecas);

	} catch (erro) {
		console.error(erro);
	}
	res.status(500);
	throw new Error("Erro interno do servidor ao buscar peças da demanda.");
});



module.exports = {
	criarDemanda,
	lerDemandas,
	lerPecasDemanda
}