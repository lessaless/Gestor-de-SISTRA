const asyncHandler = require("express-async-handler");

const { deletarArquivo } = require("./arquivoController");
const gerarIdDemanda = require("../utils/gerarIds/gerarIdDemanda");
const gerarIdCN = require("../utils/gerarIds/gerarIdCN");
const gerarIdETPE = require("../utils/gerarIds/gerarIdETPE");
const gerarIdProposta = require("../utils/gerarIds/gerarIdProposta");
const gerarIdGerais = require("../utils/gerarIds/gerarIdGerais");
const gerarIdSistras = require("../utils/gerarIds/gerarIdSistras");
const logger = require("../utils/logs/logger");
const sanitizeMongoFilter = require("../utils/sanitizarQuery/sanitizarQuery");
const { objModelos, colecoesLiberadas } = require("../utils/modelosMongo/modelosMongo");
const filtrarPermitidos = require("../utils/permissoesCrudObj/filtrarPermitidos");
const { incluirNoFluxo, atualizarFluxo, removerDoFluxo } = require("../utils/fluxoCrud/fluxoCrud");
const { gerarCodigosBim, removerCodigosBim, determinarTipoDocumento } = require("../utils/gerarIds/gerarCodigoBimController");

const validarCamposCalculados = require("../utils/validarCampoTempo/validarCamposCalculados");
const colecaoModelo = (req, res) => {

	const metodo = req.method;
	let colecao, Modelo, obj, buscarChaves, automaticos;
	const user = req.user;

	if (metodo !== 'GET') logger.info(`TRY: ${metodo} - ${user.SARAM}/${user.nome}`);

	switch (metodo) {
		case 'GET':
			buscarChaves = !!req.query.chaves;
			console.log("Valor de buscarChaves é", buscarChaves)
			let filtroOriginal = req.query.filtro;
			console.log("Valor de req.query.filtro é", req.query.filtro)
			// console.log("CRUD CONTROLLER: Filtro original:", filtroOriginal)

			// logger.info("CRUD CONTROLLER: Filtro original:", filtroOriginal);

			// obj = req.query.filtro ? JSON.parse(req.query.filtro) : {}; usado no Acervo Técnico
			// Verifica se é string antes de fazer parse
			obj = req.query.filtro
				? (typeof req.query.filtro === 'string'
					? JSON.parse(req.query.filtro)
					: req.query.filtro)
				: {};
			// console.log("Valor de obj em crudController é", obj)
			try {
				if (req.query.filtro) {
					obj = typeof req.query.filtro === 'string'
						? JSON.parse(req.query.filtro)
						: req.query.filtro;
				}
				// obj = filtroOriginal ? sanitizeMongoFilter(JSON.parse(filtroOriginal)) : {};
				console.log("Valor de obj é", obj)
			} catch (err) {
				console.log('\n', err.message, '\n');
				logger.error(`${err.message} - ${user.SARAM}/${user.nome}. Filtro: ${filtroOriginal}`);
				res.status(400);
				throw new Error("Filtro inválido ou não autorizado!");

			}

			colecao = req.query.colecao;
			automaticos = objModelos[colecao]?.automaticos;
			console.log("Valor de automaticos é", automaticos)
			console.log("Valor de colecao é", colecao)
			break;

		case 'POST':
			obj = filtrarPermitidos(req.body);
			obj.criado_por = user.SARAM;
			obj.om_autora = user.OM;
			colecao = req.body.colecao;
			break;

		case 'PATCH':
			obj = filtrarPermitidos(req.body);
			obj.modificado_por = user.SARAM;
			/* obj.om_autora = user.OM; */
			colecao = req.body.colecao;
			break;

		case 'DELETE':
			// let filtroStrToObj = JSON.parse(req.query.filtro);
			let filtroStrToObj = req.query.filtro
				? (typeof req.query.filtro === 'string'
					? JSON.parse(req.query.filtro)
					: req.query.filtro)
				: {};
			let id = filtroStrToObj._id;
			if (!id) {
				logger.error(`_id de objeto não especificado ou é inválido! - ${user.SARAM}/${user.nome}`)
				res.status(400);
				throw new Error("_id de objeto não especificado ou é inválido!");
			}
			obj = { '_id': id };
			obj.deletado_por = user._id;
			colecao = req.query.colecao;
			break;

		default:
			logger.error(`Método não permitido (${metodo}) - ${user.SARAM}/${user.nome}`)
			res.status(405);
			throw new Error(`Método não permitido: ${metodo}.`);
	}


	if (!colecao) {
		logger.error(`Não foi especificada a coleção! - ${user.SARAM}/${user.nome}`)
		res.status(400);
		throw new Error("Não foi especificada a coleção!");
	}
	if (!(colecao in objModelos)) {
		logger.error(`Coleção inválida! (${colecao}) - ${user.SARAM}/${user.nome}`)
		res.status(400);
		throw new Error("Coleção inválida!");
	}

	const colecoesAutorizadas = colecoesLiberadas[metodo].includes(colecao);

	if (!colecoesAutorizadas) {
		logger.error(`Solicitação não autorizada para a coleção: ${colecao} - ${user.SARAM}/${user.nome}`)
		res.status(403);
		throw new Error(`Solicitação não autorizada para a coleção: ${colecao}`);
	}

	Modelo = objModelos[colecao].modelo;

	if (!Modelo) {
		logger.error(`Não foi encontrado um modelo para a coleção: ${colecao} - ${user.SARAM}/${user.nome}`)
		res.status(404);
		throw new Error(`Não foi encontrado um modelo para a coleção: ${colecao}`);
	}

	return { Modelo, obj, buscarChaves, automaticos };
};


const criarDados = asyncHandler(async (req, res) => {

	const { Modelo, obj } = colecaoModelo(req, res);
	console.log("Valor de Modelo, obj é", Modelo, obj)
	// ========================================
	// Validar campos calculados
	// ========================================
	validarCamposCalculados(obj);
	console.log("Valor de Modelo.modelName em crudController é", Modelo.modelName)
	switch (Modelo.modelName) {
		case 'Demanda': {
			obj.id_demanda = await gerarIdDemanda(obj.ods_objeto);
		}
		// console.log("Passou por crudController", obj.id_demanda)
		// case 'Acidente': {
		// 	obj.id_demanda = await gerarIdSistras(obj.ods_objeto);
		// }
		// 	console.log("Passou por crudController", obj.id_sistra)
		case 'CN': {
			obj.id_cn = await gerarIdCN(obj.id_demanda);
		}
		case 'ETPE': {
			obj.id_etpe = await gerarIdETPE(obj.id_demanda);
		}
		case 'Proposta': {
			obj.id_proposta = await gerarIdProposta(obj.id_demanda);
		}
	}
	// ========================================================= //
	// Novo. Inserção de Códigos BIM
	// Determinar se este tipo de documento precisa de códigos BIM
	// ======================================================== //
	const tipoDocumento = determinarTipoDocumento(Modelo);
	// console.log("Valor de tipoDocumento é", tipoDocumento)
	if (tipoDocumento && obj.id_demanda) {
		try {
			// Gerar códigos BIM automaticamente (não precisa passar Modelo)
			await gerarCodigosBim({
				obj,
				tipoDocumento
			});
		} catch (error) {
			console.error("Erro ao gerar códigos BIM:", error);
			// Decidir se deve lançar erro ou apenas logar
			// Descomente a linha abaixo se quiser que falhe ao não gerar códigos BIM
			// throw new Error("Falha ao gerar códigos BIM: " + error.message);
		}
	}
	// ========================================================= //
	// 								FIM
	// ======================================================== //

	if (Modelo.collection.name === 'gerais') {
		console.log("Valor de obj é", obj)
		obj.id_gerais = await gerarIdGerais(Modelo, obj);
	}

	// ========================================== //
	// ================= SISTRA ================= //
	// ========================================== //

	if (Modelo.collection.name === 'sistragerais') {
		console.log("Valor de obj, linha 178 é", obj)
		console.log("Valor de Modelo.collection.name, linha 179 é", Modelo.collection.name)
		obj.id_sistra = await gerarIdSistras(Modelo, obj);
		console.log("Valor de obj.id_sistra em crudController é", obj.id_sistra)
	}
	// ========================================== //
	// ================= Fim  SISTRA ============== //
	// ========================================== //
	const objetoBson = await Modelo.create(obj);
	if (!objetoBson) {
		res.status(500);
		throw new Error('Erro interno do servidor ao criar objeto!');
	}

	// vincular ao fluxo, se houver id_demanda
	await incluirNoFluxo({
		id_demanda: objetoBson.id_demanda,
		refId: objetoBson._id,
		colecao: req.body.colecao,
	});

	logger.info(`OK: ${req.user.SARAM}/${req.user.nome} criou '${Modelo.modelName}': ${JSON.stringify(objetoBson)}`);

	// Antes de 05/11
	// if (Modelo.collection.name === 'gerais') {
	// 	return res.status(201).json({ message: 'Criado com sucesso', id_gerais: obj.id_gerais, _id: objetoBson._id, id_demanda: obj.id_demanda });//tem que sempre mandar o _id para o reset mudar a pagina Criar para Editar
	// }


	// switch (Modelo.modelName) {
	// 	case 'Demanda': {
	// 		return res.status(201).json({ message: 'Criado com sucesso', id_demanda: obj.id_demanda });
	// 	}
	// 	case 'CN': {
	// 		return res.status(201).json({
	// 			message: 'Criado com sucesso', 
	// 			id_cn: obj.id_cn, });
	// 	}
	// 	case 'ETPE': {
	// 		return res.status(201).json({
	// 			message: 'Criado com sucesso',
	// 			id_etpe: obj.id_etpe,
	// 		});
	// 	}
	// 	case 'Proposta': {
	// 		return res.status(201).json({ message: 'Criado com sucesso', id_proposta: obj.id_proposta });
	// 	}
	// 	default: {
	// 		return res.status(201).json({ message: 'Criado com sucesso', _id: objetoBson._id });
	// 	}
	// }
	// //return res.status(201).json(objetoBson.);


	// Depois:
	if (Modelo.collection.name === 'gerais') {
		return res.status(201).json({
			message: 'Criado com sucesso',
			id_gerais: obj.id_gerais,
			_id: objetoBson._id,
			id_demanda: obj.id_demanda,
			// Incluir códigos BIM na resposta se existirem
			...(obj.codigo_documento_bim && { codigo_documento_bim: obj.codigo_documento_bim }),
			...(obj.codigo_projeto_bim && { codigo_projeto_bim: obj.codigo_projeto_bim })
		});
	}


	// ========================================== //
	// ================= SISTRA ================= //
	// ========================================== //

	if (Modelo.collection.name === 'sistragerais') {
		return res.status(201).json({
			message: 'Criado com sucesso',
			id_sistra: obj.id_sistra,
			_id: objetoBson._id,
			id_demanda: obj.id_demanda,
			// Incluir códigos BIM na resposta se existirem
			...(obj.codigo_documento_bim && { codigo_documento_bim: obj.codigo_documento_bim }),
			...(obj.codigo_projeto_bim && { codigo_projeto_bim: obj.codigo_projeto_bim })
		});
	}


	// ========================================== //
	// ================= Fim SISTRA ================= //
	// ========================================== //
	switch (Modelo.modelName) {
		case 'Demanda': {
			return res.status(201).json({ message: 'Criado com sucesso', id_demanda: obj.id_demanda });
		}
		case 'CN': {
			return res.status(201).json({
				message: 'Criado com sucesso',
				id_cn: obj.id_cn,
				...(obj.codigo_documento_bim && { codigo_documento_bim: obj.codigo_documento_bim }),
				...(obj.codigo_projeto_bim && { codigo_projeto_bim: obj.codigo_projeto_bim })
			});
		}
		case 'ETPE': {
			return res.status(201).json({
				message: 'Criado com sucesso',
				id_etpe: obj.id_etpe,
				...(obj.codigo_documento_bim && { codigo_documento_bim: obj.codigo_documento_bim }),
				...(obj.codigo_projeto_bim && { codigo_projeto_bim: obj.codigo_projeto_bim })
			});
		}
		case 'Proposta': {
			return res.status(201).json({ message: 'Criado com sucesso', id_proposta: obj.id_proposta });
		}
		default: {
			return res.status(201).json({ message: 'Criado com sucesso', _id: objetoBson._id });
		}
	}
	//return res.status(201).json(objetoBson.);
})


const lerDados = asyncHandler(async (req, res) => {

	const { Modelo, obj, buscarChaves, automaticos } = colecaoModelo(req, res);

	if (buscarChaves) {
		const listaChaves = Object.keys(Modelo.schema.paths)
			.map(key => {
				const path = Modelo.schema.paths[key];
				let automatico = automaticos.includes(key);
				if (!automatico) {//não envia as chaves automáticas para usuário não admin
					return {
						automatico: automatico,
						nome: key,
						obrigatorio: !!path.isRequired,
						tipo: path.instance,
					};
				}
			})
			.filter(key => key !== undefined);

		if (!listaChaves || listaChaves.length === 0) {
			res.status(500);
			throw new Error(`Erro ao gerar formulário para o modelo: ${Modelo}`);
		}
		return res.status(200).json(listaChaves);
	}

	const resp = await Modelo.find(obj);//se undefined, busca tudo no modelo
	if (!resp) {
		res.status(500);
		throw new Error();
	}

	//logger.info(`OK: ${req.user.SARAM}/${req.user.nome} CRIOU: ${JSON.stringify(objetoBson._id)}`);
	return res.status(200).json(resp);
});


// ========================================= //
// ======= Antes de 13/11/2025 ======= //
// ========================================= //
// const atualizarDados = asyncHandler(async (req, res) => {

// 	const { Modelo, obj } = colecaoModelo(req, res);
// 	const id = obj._id;
// 	// console.log("O valor de obj.arquivo_id:", obj.arquivo_id)
// 	obj._id && delete obj._id;
// 	'__v' in obj && delete obj.__v;

// 	const docBeforeUpdate = await Modelo.findById(id);

// 	//------------------------------------------ EXCLUSÃO DE ARQUIVO
// 	if (obj.arquivo_id === null) {
// 		// console.log("O valor de arquivo_id:", arquivo_id)
// 		delete obj.arquivo_id;
// 		obj.$unset = { arquivo_id: "" };//deletar chave desta coleção
// 		req.query.id = docBeforeUpdate.arquivo_id;
// 		req.query.modo = 'metadados';
// 		await deletarArquivo(req);//deletar arquivo e objeto BD
// 	}//--------------------------------------------------------------

// 	if (docBeforeUpdate.arquivo_id && obj.arquivo_id) {
// 		//se houver arquivo antes e depois
// 		// console.log("O valor de arquivo_id:", arquivo_id)
// 		if (docBeforeUpdate.arquivo_id.toString() !== obj.arquivo_id.toString()) {//se houver mudança de arquivo
// 			req.query.id = docBeforeUpdate.arquivo_id;
// 			req.query.modo = 'metadados';
// 			await deletarArquivo(req);//deletar arquivo antigo
// 		}
// 	}
// 	//  =========================================== //
// 	//  == Não é para ser usado, em caso de testes == //
// 	//  ========================================== //
// 	// if (Modelo.modelName === 'Gerais') {
// 	// 	if (obj.arquivo_id) obj.expireAt = null;// se inserir arquivo, não expira mais
// 	// 	else obj.expireAt = new Date(Date.now() + (30 * 24 - 3) * 60 * 60 * 1000);// se remover, expira em 30 dias a partir da data de remoção
// 	// }
// 	// ========== NOVO CÓDIGO (Códigos BIM) ==========
// 	const tipoDocumento = determinarTipoDocumento(Modelo);

// 	if (tipoDocumento) {
// 		// Caso 1: Está vinculando ou mudando de demanda
// 		if (obj.id_demanda && obj.id_demanda !== "_desvincular") {
// 			// Se não tinha demanda antes OU mudou de demanda
// 			const mudouDemanda = !docBeforeUpdate.id_demanda || 
// 			                     docBeforeUpdate.id_demanda.toString() !== obj.id_demanda.toString();

// 			if (mudouDemanda) {
// 				try {
// 					await gerarCodigosBim({
// 						obj,
// 						tipoDocumento
// 					});
// 				} catch (error) {
// 					console.error("Erro ao gerar códigos BIM na atualização:", error);
// 					// Descomente se quiser que falhe
// 					// throw new Error("Falha ao gerar códigos BIM: " + error.message);
// 				}
// 			}
// 		}

// 		// Caso 2: Está desvinculando da demanda
// 		if (obj.id_demanda === null || obj.id_demanda === "_desvincular") {
// 			removerCodigosBim(obj);
// 		}
// 	}

// 	const resp = await Modelo.findByIdAndUpdate(id, obj, { new: true, runValidators: true });
// 	//new: true: Retorna o documento atualizado após a atualização.
// 	//runValidators: true: Garante que as validações do esquema sejam aplicadas antes de executar a atualização.

// 	if (!resp) {
// 		logger.error(`Não atualizado - ${req.user.SARAM}/${req.user.nome} - Objeto proposto: ${JSON.stringify(obj)}`);
// 		res.status(500);
// 		throw new Error('Erro interno do servidor ao atualizar objeto!');
// 	}

// 	// sincronizar fluxo
// 	await atualizarFluxo({
// 		docAntes: docBeforeUpdate,
// 		docDepois: resp,
// 		colecao: req.body.colecao,
// 	});

// 	logger.info(`OK: Objeto atualizado (${docBeforeUpdate._id}) - ${req.user.SARAM}/${req.user.nome}`);
// 	logger.info(`Objeto antigo: ${JSON.stringify(docBeforeUpdate)}`);
// 	logger.info(`Objeto novo: ${JSON.stringify(resp)}`);
// 	return res.status(201).json(resp);
// });
// ========================================= //
// ======= Fim ======= //
// ========================================= //


// ======================================================== //
// ======= Criado em 13/11/2025 =========================== //
// ======= Conserta o bug de Desvincular da demanda ======= //
// ======================================================== //
const atualizarDados = asyncHandler(async (req, res) => {

	const { Modelo, obj } = colecaoModelo(req, res);
	const id = obj._id;
	obj._id && delete obj._id;
	'__v' in obj && delete obj.__v;

	const docBeforeUpdate = await Modelo.findById(id);
	validarCamposCalculados(obj);
	//------------------------------------------ EXCLUSÃO DE ARQUIVO
	if (obj.arquivo_id === null) {
		delete obj.arquivo_id;
		obj.$unset = { arquivo_id: "" };
		req.query.id = docBeforeUpdate.arquivo_id;
		req.query.modo = 'metadados';
		await deletarArquivo(req);
	}

	if (docBeforeUpdate.arquivo_id && obj.arquivo_id) {
		if (docBeforeUpdate.arquivo_id.toString() !== obj.arquivo_id.toString()) {
			req.query.id = docBeforeUpdate.arquivo_id;
			req.query.modo = 'metadados';
			await deletarArquivo(req);
		}
	}

	// ✅ Handle id_demanda unlinking FIRST
	const isUnlinking = obj.id_demanda === null || obj.id_demanda === "_desvincular";

	if (isUnlinking) {
		delete obj.id_demanda; // Remove from update object
		if (!obj.$unset) obj.$unset = {};
		obj.$unset.id_demanda = "";
	}

	// ========== CÓDIGO DOS CÓDIGOS BIM ==========
	const tipoDocumento = determinarTipoDocumento(Modelo);

	if (tipoDocumento) {
		// Caso 1: Está vinculando ou mudando de demanda
		if (obj.id_demanda && obj.id_demanda !== "_desvincular") {
			const mudouDemanda = !docBeforeUpdate.id_demanda ||
				docBeforeUpdate.id_demanda.toString() !== obj.id_demanda.toString();

			if (mudouDemanda) {
				try {
					await gerarCodigosBim({
						obj,
						tipoDocumento
					});
				} catch (error) {
					console.error("Erro ao gerar códigos BIM na atualização:", error);
				}
			}
		}

		// Caso 2: Está desvinculando da demanda
		if (isUnlinking) {
			// ✅ CRITICAL: Remove BIM code fields from obj before adding to $unset
			// Otherwise MongoDB gets confused with conflicting operations
			if (obj.codigo_projeto_bim !== undefined) {
				delete obj.codigo_projeto_bim;
			}
			if (obj.codigo_documento_bim !== undefined) {
				delete obj.codigo_documento_bim;
			}

			// Now add them to $unset
			if (!obj.$unset) obj.$unset = {};
			obj.$unset.codigo_projeto_bim = "";
			obj.$unset.codigo_documento_bim = "";
		}
	}

	const resp = await Modelo.findByIdAndUpdate(id, obj, { new: true, runValidators: true });

	if (!resp) {
		logger.error(`Não atualizado - ${req.user.SARAM}/${req.user.nome} - Objeto proposto: ${JSON.stringify(obj)}`);
		res.status(500);
		throw new Error('Erro interno do servidor ao atualizar objeto!');
	}

	// sincronizar fluxo
	await atualizarFluxo({
		docAntes: docBeforeUpdate,
		docDepois: resp,
		colecao: req.body.colecao,
	});

	logger.info(`OK: Objeto atualizado (${docBeforeUpdate._id}) - ${req.user.SARAM}/${req.user.nome}`);
	logger.info(`Objeto antigo: ${JSON.stringify(docBeforeUpdate)}`);
	logger.info(`Objeto novo: ${JSON.stringify(resp)}`);
	return res.status(201).json(resp);
});



const deletarDados = asyncHandler(async (req, res) => {
	const { Modelo, obj } = colecaoModelo(req, res);//obj = filtro

	let deletado_por = obj.deletado_por;
	delete obj.deletado_por;

	const ObjetoComArquivo = await Modelo.findById(obj._id);
	const arquivo_id = ObjetoComArquivo.arquivo_id;

	if (arquivo_id) {
		req.query.id = arquivo_id;
		req.query.modo = 'metadados';
		await deletarArquivo(req);//deletar arquivo e objeto BD
	}

	const resp = await Modelo.deleteOne(obj);

	if (resp.deletedCount === 0) {
		logger.error(`Nenhum objeto encontrado para exclusão - ${req.user.SARAM}/${req.user.nome} - Filtro: ${JSON.stringify(obj)}`);
		res.status(404);
		throw new Error(`Nenhum objeto encontrado para exclusão.`);
	}

	await removerDoFluxo({
		id_demanda: ObjetoComArquivo.id_demanda,
		refId: ObjetoComArquivo._id,
		colecao: req.query.colecao,
	});

	logger.warn(`OK: Objeto deletado - ${req.user.SARAM}/${req.user.nome} - Filtro: ${JSON.stringify(obj)}`);
	logger.info(`Objeto(s) antes de deletar: ${JSON.stringify(ObjetoComArquivo)}`);

	console.log(`\n${deletado_por} deletou: ${JSON.stringify(obj)}\n`);
	return res.status(204).json({ message: `Objeto deletado com sucesso!` });
});

const substituirDados = asyncHandler(async (req, res) => {
	return res.status(200).json("Substituir Dados");
});

module.exports = {
	criarDados,
	lerDados,
	atualizarDados,
	deletarDados,
	substituirDados
}