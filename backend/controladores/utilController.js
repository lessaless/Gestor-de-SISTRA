const asyncHandler = require("express-async-handler");
const Om = require('../modelos/omModel');
const Ods = require('../modelos/odsModel');
const Estado = require('../modelos/estadoModel');
const Municipio = require("../modelos/municipioModel");
const DadosPessoais = require("../modelos/dados_pessoaisModel");
const Terreno = require("../modelos/terrenoModel");
const Benfeitoria = require("../modelos/benfeitoriaModel");
const BenfeitoriaBim = require("../modelos/benfeitoriaBimModel")
const Localidades = require("../modelos/localidadeModel")
const FasesDoProjeto = require("../modelos/faseDoProjetoModel")
const CodigoProjeto = require('../modelos/codigoProjetoModel');
const PLANINFRA = require('../modelos/planinfraModel');
const Status = require("../modelos/statusModel")

//PEI
const Disciplinas = require("../modelos/disciplinaBimModel")
const APs = require("../modelos/apModel")
const CFs = require("../modelos/cfModel")
const CMs = require("../modelos/cmModel")
const ETs = require("../modelos/etModel")
const EVs = require("../modelos/evModel")
const LAs = require("../modelos/laModel")
const LSs = require("../modelos/lsModel")
const MAs = require("../modelos/maModel")
const MCs = require("../modelos/mcModel")
const MDs = require("../modelos/mdModel")
const MDCs = require("../modelos/mdcModel")
const MFs = require("../modelos/mfModel")
const MIs = require("../modelos/miModel")
const MRs = require("../modelos/mrModel")
const NSs = require("../modelos/nsModel")
const NTs = require("../modelos/ntModel")
const ODs = require("../modelos/odModel")
const PBs = require("../modelos/pbModel")
const PGs = require("../modelos/pgModel")
const POs = require("../modelos/poModel")
const PPs = require("../modelos/ppModel")
const PTs = require("../modelos/ptModel")
const REs = require("../modelos/reModel")
const RTs = require("../modelos/rtModel")
const TAs = require("../modelos/taModel")
const TEs = require("../modelos/teModel")
const TJs = require("../modelos/tjModel")
const TMs = require("../modelos/tmModel")
const TRs = require("../modelos/trModel")

//SISTRA 
const AgenteCausadorAcidente = require("../modelos/agenteCausadorDoAcidenteModel")
const SituacaoGeradora = require("../modelos/situacaoGeradoraModel")
const ParteDoCorpoAtingida = require("../modelos/parteDoCorpoAtingidaModel")

// =================== //
// ===== SISTRA =====  //
// =================== //
const obterAgenteCausadorAcidentes = asyncHandler(async (req, res) => {
	try {
		// Buscar todos os documentos na coleção 'agentescausadores'
		const agenteCausadorAcidente = await AgenteCausadorAcidente.find({}, { codigo: 1, descricao: 1, _id: 0 });
		console.log("Valor de agenteCausadorAcidente é ", agenteCausadorAcidente)
		// Retornar a lista de valores 'agentescausadores'
		return res.status(200).json(agenteCausadorAcidente);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter os valores de AgenteCausadorAcidente');
	}
});

const obterSituacaoGeradoras = asyncHandler(async (req, res) => {
	try {
		// Buscar todos os documentos na coleção 'agentescausadores'
		const situacaoGeradora = await SituacaoGeradora.find({}, { codigo: 1, situacaogeradora: 1, _id: 0 });
		console.log("Valor de situacaoGeradora é ", situacaoGeradora)
		// Retornar a lista de valores 'agentescausadores'
		return res.status(200).json(situacaoGeradora);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter os valores de situacaoGeradora');
	}
});

const obterParteDoCorpoAtingidas = asyncHandler(async (req, res) => {
	try {
		// Buscar todos os documentos na coleção 'agentescausadores'
		const parteDoCorpoAtingida = await ParteDoCorpoAtingida.find({}, { codigo: 1, descricao: 1, _id: 0 });
		console.log("Valor de parteDoCorpoAtingida é ", parteDoCorpoAtingida)
		// Retornar a lista de valores 'agentescausadores'
		return res.status(200).json(parteDoCorpoAtingida);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter os valores de ParteDoCorpoAtingida');
	}
});


// =================== //
// ===== fim SISTRA =====  //
// =================== //
// modelo para um obter que possua dois valores
const obterFasesDoProjeto = asyncHandler(async (req, res) => {
	try {
		// Busca na coleção DadosPessoais e projeta apenas os campos POSTO, NOME e OM
		const fasesDoProjeto = await FasesDoProjeto.find({}, { codigo: 1, titulo: 1, _id: 0 });
		return res.status(200).json(fasesDoProjeto);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de Fases do Projeto');
	}
});
const obterOMs = asyncHandler(async (req, res) => {
	try {
		// Buscar todos os documentos na coleção 'oms'
		const omsDocs = await Om.find({}, { om: 1, _id: 0 });

		// Extrair os valores do campo 'om'
		const oms = omsDocs.map(doc => doc.om);

		// Retornar a lista de valores 'om'
		return res.status(200).json(oms);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter os valores de om');
	}
});

const obterODS = asyncHandler(async (req, res) => {
	try {
		// Buscar todos os documentos na coleção 'oms'
		const odsDocs = await Ods.find({}, { ods: 1, _id: 0 });

		// Extrair os valores do campo 'om'
		const ods = odsDocs.map(doc => doc.ods);

		// Retornar a lista de valores 'om'
		return res.status(200).json(ods);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter os valores de om');
	}
});

const obterEstados = asyncHandler(async (req, res) => {
	try {
		// Buscar todos os documentos na coleção 'oms'
		const estadoDocs = await Estado.find({}, { estado: 1, _id: 0 });

		// Extrair os valores do campo 'om'
		const estados = estadoDocs.map(doc => doc.estado);

		// Retornar a lista de valores 'om'
		return res.status(200).json(estados);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de Estados do Brasil');
	}
});



const obterMunicipios = asyncHandler(async (req, res) => {
	try {
		// Obter o Estado passado como parâmetro
		const { estado } = req.query;


		// Buscar todos os documentos na coleção 'municipios' que correspondem ao estado
		const municipioDocs = await Municipio.find({ estado: estado }, { municipio: 1, _id: 0 });

		// Extrair os valores do campo 'om'
		const municipios = municipioDocs.map(doc => doc.municipio);

		// Retornar a lista de valores 'om'
		return res.status(200).json(municipios);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de Estados do Brasil');
	}
});

const obterEfetivo = asyncHandler(async (req, res) => {
	try {
		// Busca na coleção DadosPessoais e projeta apenas os campos POSTO, NOME e OM

		// const efetivo = await DadosPessoais.find({}, 'SARAM POSTO NOME OM').exec();
		const efetivo = await DadosPessoais.find({}, { SARAM: 1, POSTO: 1, NOME: 1, OM: 1, _id: 0 }).exec();//exclui _id 'info sensível', conforme relatório CDCAER

		return res.status(200).json(efetivo);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista do Efetivo');
	}
});

const obterTerrenos = asyncHandler(async (req, res) => {
	try {
		// Busca na coleção DadosPessoais e projeta apenas os campos POSTO, NOME e OM
		const terrenos = await Terreno.find({}, { NR_TOMBO: 1, endereco: 1, _id: 0 });
		return res.status(200).json(terrenos);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de Terrenos');
	}
});

const obterBenfeitorias = asyncHandler(async (req, res) => {
	try {
		// Busca na coleção DadosPessoais e projeta apenas os campos POSTO, NOME e OM
		const benfeitorias = await Benfeitoria.find({}, { id_benfeitoria: 1, apelido: 1, _id: 0 });
		return res.status(200).json(benfeitorias);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de Benfeitorias');
	}
});

const obterBenfeitoriasBim = asyncHandler(async (req, res) => {
	try {
		const benfeitoriasBim = await BenfeitoriaBim.find({}, { codigo: 1, titulo: 1, _id: 0 });
		return res.status(200).json(benfeitoriasBim);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de Benfeitorias Bim');
	}
});

const obterLocalidades = asyncHandler(async (req, res) => {
	try {
		// Busca na coleção DadosPessoais e projeta apenas os campos POSTO, NOME e OM
		const localidades = await Localidades.find({}, { OM_titulo: 1, codigo: 1, _id: 0 });
		return res.status(200).json(localidades);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de Localidades');
	}
});

const obterCodigosBim = asyncHandler(async (req, res) => {
	try {
		// Buscar todos os documentos na coleção 'oms'
		const codigosBim = await CodigoProjeto.find({}, { codigo_documento_bim: 1, codigo_projeto_bim: 1, estado_demanda: 1, _id: 0 });
		// Retornar a lista de valores 'om'
		return res.status(200).json(codigosBim);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de códigos bim');
	}
});

const obterPlaninfras = asyncHandler(async (req, res) => {
	try {
		// Buscar todos os documentos na coleção 'oms'
		const planinfras = await PLANINFRA.find({}, { codigo_bim_planinfra: 1, id_demanda: 1, _id: 0 });
		// Retornar a lista de valores 'om'
		return res.status(200).json(planinfras);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de planinfras');
	}
});

// const obterFasesDoProjeto = asyncHandler(async (req, res) => {
// 	try {
// 		// Busca na coleção DadosPessoais e projeta apenas os campos POSTO, NOME e OM
// 		const fasesDoProjeto = await FasesDoProjeto.find({}, { codigo: 1, titulo: 1, _id: 0 });
// 		return res.status(200).json(fasesDoProjeto);
// 	} catch (error) {
// 		res.status(500);
// 		throw new Error('Erro ao obter a lista de Fases do Projeto');
// 	}
// });

const obterStatus = asyncHandler(async (req, res) => {
	try {
		// Busca na coleção DadosPessoais e projeta apenas os campos POSTO, NOME e OM
		const status = await Status.find({}, { status: 1, _id: 0 });
		return res.status(200).json(status);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de Status do Projeto');
	}
});

const obterRecurso = asyncHandler(async (req, res) => {
	try {
		// Busca na coleção DadosPessoais e projeta apenas os campos POSTO, NOME e OM
		const recursos = await Recursos.find({}, { codigo: 1, titulo: 1, _id: 0 });
		return res.status(200).json(recursos);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de Recursos para o Projeto');
	}
});


const obterDisciplinas = asyncHandler(async (req, res) => {
	try {
		// Busca na coleção DadosPessoais e projeta apenas os campos POSTO, NOME e OM
		const disciplinas = await Disciplinas.find({}, { codigo: 1, titulo: 1, _id: 0 });
		return res.status(200).json(disciplinas);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de Disciplinas para o Projeto');
	}
});

const obterAps = asyncHandler(async (req, res) => {
	try {
		const ap = await APs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(ap);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de APs para o Projeto');
	}
});

const obterCfs = asyncHandler(async (req, res) => {
	try {
		const cf = await CFs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(cf);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de CFs para o Projeto');
	}
});

const obterCms = asyncHandler(async (req, res) => {
	try {
		const cm = await CMs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(cm);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de CMs para o Projeto');
	}
});

const obterEts = asyncHandler(async (req, res) => {
	try {
		const et = await ETs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(et);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de ETs para o Projeto');
	}
});

const obterEvs = asyncHandler(async (req, res) => {
	try {
		const ev = await EVs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(ev);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de EVs para o Projeto');
	}
});

const obterLas = asyncHandler(async (req, res) => {
	try {
		const la = await LAs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(la);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de LAs para o Projeto');
	}
});

const obterLss = asyncHandler(async (req, res) => {
	try {
		const ls = await LSs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(ls);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de LSs para o Projeto');
	}
});

const obterMas = asyncHandler(async (req, res) => {
	try {
		const ma = await MAs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(ma);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de MAs para o Projeto');
	}
});

const obterMcs = asyncHandler(async (req, res) => {
	try {
		const mc = await MCs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(mc);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de MCs para o Projeto');
	}
});

const obterMds = asyncHandler(async (req, res) => {
	try {
		const md = await MDs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(md);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de MDs para o Projeto');
	}
});

const obterMdcs = asyncHandler(async (req, res) => {
	try {
		const mdc = await MDCs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(mdc);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de MDCs para o Projeto');
	}
});

const obterMfs = asyncHandler(async (req, res) => {
	try {
		const mf = await MFs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(mf);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de MFs para o Projeto');
	}
});

const obterMis = asyncHandler(async (req, res) => {
	try {
		const mi = await MIs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(mi);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de MIs para o Projeto');
	}
});

const obterMrs = asyncHandler(async (req, res) => {
	try {
		const mr = await MRs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(mr);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de MRs para o Projeto');
	}
});

const obterNss = asyncHandler(async (req, res) => {
	try {
		const ns = await NSs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(ns);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de NSs para o Projeto');
	}
});

const obterNts = asyncHandler(async (req, res) => {
	try {
		const nt = await NTs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(nt);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de NTs para o Projeto');
	}
});

const obterOds = asyncHandler(async (req, res) => {
	try {
		const od = await ODs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(od);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de ODs para o Projeto');
	}
});

const obterPbs = asyncHandler(async (req, res) => {
	try {
		const pb = await PBs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(pb);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de PBs para o Projeto');
	}
});

const obterPgs = asyncHandler(async (req, res) => {
	try {
		const pg = await PGs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(pg);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de PGs para o Projeto');
	}
});

const obterPos = asyncHandler(async (req, res) => {
	try {
		const po = await POs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(po);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de POs para o Projeto');
	}
});

const obterPps = asyncHandler(async (req, res) => {
	try {
		const pp = await PPs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(pp);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de PPs para o Projeto');
	}
});

const obterPts = asyncHandler(async (req, res) => {
	try {
		const pt = await PTs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(pt);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de PTs para o Projeto');
	}
});

const obterRes = asyncHandler(async (req, res) => {
	try {
		const re_data = await REs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(re_data);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de REs para o Projeto');
	}
});

const obterRts = asyncHandler(async (req, res) => {
	try {
		const rt = await RTs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(rt);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de RTs para o Projeto');
	}
});

const obterTas = asyncHandler(async (req, res) => {
	try {
		const ta = await TAs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(ta);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de TAs para o Projeto');
	}
});

const obterTes = asyncHandler(async (req, res) => {
	try {
		const te = await TEs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(te);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de TEs para o Projeto');
	}
});

const obterTjs = asyncHandler(async (req, res) => {
	try {
		const tj = await TJs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(tj);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de TJs para o Projeto');
	}
});

const obterTms = asyncHandler(async (req, res) => {
	try {
		const tm = await TMs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(tm);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de TMs para o Projeto');
	}
});

const obterTrs = asyncHandler(async (req, res) => {
	try {
		const tr = await TRs.find({}, { disciplina_principal: 1, codigo_projeto_bim: 1, codigo_documento_bim: 1, _id: 0 });
		return res.status(200).json(tr);
	} catch (error) {
		res.status(500);
		throw new Error('Erro ao obter a lista de TRs para o Projeto');
	}
});



module.exports = {
	obterOMs,
	obterAgenteCausadorAcidentes,
	obterSituacaoGeradoras,
	obterParteDoCorpoAtingidas,
	obterODS,
	obterEstados,
	obterMunicipios,
	obterEfetivo,
	obterTerrenos,
	obterBenfeitorias,
	obterBenfeitoriasBim,
	obterLocalidades,
	obterFasesDoProjeto,
	obterCodigosBim,
	obterPlaninfras,
	obterRecurso,
	obterStatus,
	obterDisciplinas,
	obterAps,
	obterCfs,
	obterCms,
	obterEts,
	obterEvs,
	obterLas,
	obterLss,
	obterMas,
	obterMcs,
	obterMds,
	obterMdcs,
	obterMfs,
	obterMis,
	obterMrs,
	obterNss,
	obterNts,
	obterOds,
	obterPbs,
	obterPgs,
	obterPos,
	obterPps,
	obterPts,
	obterRes,
	obterRts,
	obterTas,
	obterTes,
	obterTjs,
	obterTms,
	obterTrs,
}