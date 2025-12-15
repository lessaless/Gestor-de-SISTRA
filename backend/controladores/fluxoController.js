const asyncHandler = require("express-async-handler");
const Demanda = require("../modelos/demandaModel");
const Fluxo = require("../modelos/fluxoModel"); // novo schema
const tratarErrosModel = require("../utils/tratamentoErrosMDB/tratamentoErrosMDB");
const gerarIdDemanda = require("../utils/gerarIds/gerarIdDemanda");
const filtrarPermitidos = require("../utils/permissoesCrudObj/filtrarPermitidos");



// ================= CRIAR DEMANDA =================
const criarDemanda = asyncHandler(async (req, res) => {
  const criado_por = req.user.SARAM;
  // console.log("passou pelo criarDemanda de fluxoController")
  const body = filtrarPermitidos({ ...req.body });
  // console.log("Valor de body", body)
  delete body.id_demanda; // manter
  // console.log("valor de arquivo em fluxoController", arquivo)
  const arquivo_id = body.arquivo_id

  const id = await gerarIdDemanda(req.body.ods_objeto)


  try {
    const demandaBson = await Demanda.create({
      // id_demanda,
      ...body,
      arquivo_id,
      id_demanda: id,
      criado_por,
      modificado_por: req.user.SARAM,

      // titulo_demanda
    });

    // console.log("valor de demandaBson", demandaBson)
    if (!demandaBson) {
      // console.log("Erro em demandaBson")
      res.status(500);
      throw new Error('Erro interno do servidor ao criar objeto!');
    }
    // await Fluxo.updateOne(
    //   { id_demanda: id },
    //   {
    //     $setOnInsert: {
    //       id_demanda: id,
    //       criado_por,
    //       ts_criacao: new Date(),
    //       pecas_fluxo: [
    //         {
    //           colecao: "demandas",
    //           refId: demandaBson._id,
    //         },
    //       ],
    //     },
    //   },
    //   { upsert: true }
    // );
  //     // console.log(demandaBson)
  //     // cria um registro PPI associado a esta demanda
  const fluxo = await Fluxo.create({
    id_demanda: demandaBson?.id_demanda.toString(), // ou use codigo_demanda se preferir
    pecas_fluxo: [{
      colecao: "demandas",
      refId: demandaBson?._id
    }]
  });
  // console.log("O valor de fluxo dentro de Fluxo.create é ", fluxo)
  if (!fluxo) {
    res.status(500);
    throw new Error('Erro interno do servidor ao criar fluxo!');
  }

  return res.status(201).json(demandaBson);

  } catch (erro) {
    console.error(erro)
    res.status(500);
    throw new Error(tratarErrosModel(erro));
  }
});




// ================= LER DEMANDAS =================
const lerDemandas = asyncHandler(async (req, res) => {
  try {
    const demandas = await Demanda.find(req.body.filtro); // se undefined, busca todas
    return res.status(200).json(demandas);
  } catch (erro) {
    console.error(erro);
    res.status(500);
    throw new Error("Erro interno do servidor ao buscar demandas.");
  }
});


// ================= LER PEÇAS DA DEMANDA =================
const lerFluxo = asyncHandler(async (req, res) => {
  try {
    const { id_demanda } = req.query;
    if (!id_demanda) {
      return res.status(400).json({ message: "id_demanda é obrigatório." });
    }

    const fluxo = await Fluxo.findOne({ id_demanda });
    // console.log("O valor de fluxo é ", fluxo)
    if (!fluxo) {
      return res.status(404).json({ message: "Demanda não encontrada em Fluxo." });
    }

    // const pecas = [];
    // for (const peca of ppi.pecas_fluxo) {
    // 	let doc = null;
    // 	switch (peca.collection) {
    // 		case "cn":
    // 			doc = await CN.findById(peca.refId);
    // 			break;
    // 		case "etpe":
    // 			doc = await Etpe.findById(peca.refId);
    // 			break;
    // 		case "demanda":
    // 			doc = await Demanda.findById(peca.refId);
    // 			break;
    // 		case "planinfra":
    // 			doc = await Planinfra.findById(peca.refId);
    // 			break;
    // 		default:
    // 			console.warn(`Coleção desconhecida: ${peca.collection}`);
    // 	}
    // 	if (doc) pecas.push({ collection: peca.collection, data: doc });
    // }

    return res.status(200).json(fluxo);

  } catch (erro) {
    console.error(erro);
    res.status(500);
    throw new Error("Erro interno do servidor ao buscar peças da demanda.");
  }
});



module.exports = {
  criarDemanda,
  lerDemandas,
  lerFluxo
};
