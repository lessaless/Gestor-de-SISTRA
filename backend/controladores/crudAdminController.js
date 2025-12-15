const asyncHandler = require("express-async-handler");

const { deletarArquivo } = require("./arquivoController");
const gerarIdDemanda = require("../utils/gerarIds/gerarIdDemanda");
const gerarIdCN = require("../utils/gerarIds/gerarIdCN");
const gerarIdETPE = require("../utils/gerarIds/gerarIdETPE");
const gerarIdProposta = require("../utils/gerarIds/gerarIdProposta");
const gerarIdGerais = require("../utils/gerarIds/gerarIdGerais");
const { objModelos } = require("../utils/modelosMongo/modelosMongo");
const logger = require("../utils/logs/logger")
const sanitizeMongoFilter = require("../utils/sanitizarQuery/sanitizarQuery");


const colecaoModelo = (req, res) => {

	const metodo = req.method;
	let colecao, Modelo, obj, buscarChaves, automaticos;

	if (metodo !== 'GET') logger.info(`TRY: ${metodo} - ${req.user.SARAM}/${req.user.nome}`);

	//body recebe object, query recebe string
	switch (metodo) {
		case 'GET':
			buscarChaves = !!req.query.chaves;
			let filtroOriginal = req.query.filtro;
			
			// obj = req.query.filtro ? JSON.parse(req.query.filtro) : {};
			try {
				obj = filtroOriginal ? sanitizeMongoFilter(JSON.parse(filtroOriginal)) : {};

			} catch (err) {
				console.log('\n', err.message, '\n');
				logger.error(`${err.message} - ${req.user.SARAM}/${req.user.nome}. Filtro: ${filtroOriginal}`);
				res.status(400);
				throw new Error("Filtro inválido ou não autorizado!");

			}
			colecao = req.query.colecao;
			automaticos = objModelos[colecao]?.automaticos;
			break;

		case 'POST':
			const criado_por = req.user.SARAM;
			obj = req.body;
			obj.criado_por = obj.criado_por || criado_por;
			obj.om_autora = req.user.OM;
			colecao = req.body.colecao;
			break;

		case 'PATCH':
			obj = req.body;
			const modificado_por = req.user.SARAM;
			obj.modificado_por = obj.modificado_por || modificado_por;//somente admin pode alterar o modificado_por inserindo no formulário
			/* obj.om_autora = req.user.OM; */
			colecao = req.body.colecao;
			break;

		case 'DELETE':
			obj = JSON.parse(req.query.filtro) || {};//se vir vazio, deleta por coleção, só admin funciona assim
			obj.deletado_por = req.user._id;
			colecao = req.query.colecao;
			break;

		default:
			logger.error(`Método não permitido (${metodo}) - ${req.user.SARAM}/${req.user.nome}`)
			res.status(405);
			throw new Error(`Método não permitido: ${metodo}.`);
	}

	console.log(`Os valores em colecao valem: ${colecao}`)
	if (!colecao) {
		logger.error(`Não foi especificada a coleção! - ${req.user.SARAM}/${req.user.nome}`)
		res.status(400);
		throw new Error("Não foi especificada a coleção!");
	}
	if (!(colecao in objModelos)) {
		logger.error(`Coleção inválida! (${colecao}) - ${req.user.SARAM}/${req.user.nome}`)
		res.status(400);
		throw new Error("Coleção inválida!");
	}

	Modelo = objModelos[colecao].modelo;

	if (!Modelo) {
		logger.error(`Não foi encontrado um modelo para a coleção: ${colecao} - ${req.user.SARAM}/${req.user.nome}`)
		res.status(404);
		throw new Error(`Não foi encontrado um modelo para a coleção: ${colecao}`);
	}

	return { Modelo, obj, buscarChaves, automaticos };
};



const criarDados = asyncHandler(async (req, res) => {

	const { Modelo, obj } = colecaoModelo(req, res);

	const objSemVazios = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== "" && v !== undefined))


	switch (Modelo.modelName) {
		case 'Demanda': {
			objSemVazios.id_demanda = await gerarIdDemanda(objSemVazios.ods_objeto);
		}
		case 'CN': {
			objSemVazios.id_cn = await gerarIdCN(objSemVazios.id_demanda);
		}
		case 'ETPE': {
			objSemVazios.id_etpe = await gerarIdETPE(objSemVazios.id_demanda);
		}
		case 'Proposta': {
			objSemVazios.id_proposta = await gerarIdProposta(objSemVazios.id_demanda);
		}
	}

	if (Modelo.collection.name === 'gerais') {
		objSemVazios.id_gerais = await gerarIdGerais(Modelo, objSemVazios);
	}

	const objetoBson = await Modelo.create(objSemVazios);

	if (!objetoBson) {
		logger.error(`Falha para ${req.user.SARAM}/${req.user.nome} ao tentar criar ${Modelo.modelName}`);
		res.status(500);
		throw new Error('Erro interno do servidor ao criar objeto!');
	}

	logger.info(`OK: ${req.user.SARAM}/${req.user.nome} criou '${Modelo.modelName}': ${JSON.stringify(objetoBson)}`);

	if (Modelo.collection.name === 'gerais') {
		return res.status(201).json({ message: 'Criado com sucesso', id_gerais: objSemVazios.id_gerais, _id: objetoBson._id });//tem que sempre mandar o _id para o reset mudar a pagina Criar para Editar
	}

	switch (Modelo.modelName) {
		case 'Demanda': {
			return res.status(201).json({ message: 'Criado com sucesso', id_demanda: objSemVazios.id_demanda });
		}
		case 'CN': {
			return res.status(201).json({ message: 'Criado com sucesso', id_cn: objSemVazios.id_cn });
		}
		case 'ETPE': {
			return res.status(201).json({ message: 'Criado com sucesso', id_etpe: objSemVazios.id_etpe });
		}
		case 'Proposta': {
			return res.status(201).json({ message: 'Criado com sucesso', id_proposta: objSemVazios.id_proposta });
		}
		default: {
			return res.status(201).json({ message: 'Criado com sucesso', _id: objetoBson._id });
		}
	}

	//return res.status(201).json(objetoBson);
})



const lerDados = asyncHandler(async (req, res) => {

	const { Modelo, obj, buscarChaves, automaticos } = colecaoModelo(req, res);

	if (buscarChaves) {
		const listaChaves = Object.keys(Modelo.schema.paths)
			.map(key => {
				const path = Modelo.schema.paths[key];
				return {
					automatico: automaticos.includes(key),
					nome: key,
					obrigatorio: !!path.isRequired,
					tipo: path.instance,
				};
			});

		if (!listaChaves || listaChaves.length === 0) {
			res.status(500);
			throw new Error(`Erro ao gerar a lista de chaves para a modelo: ${Modelo}`);
		}
		return res.status(200).json(listaChaves);
	}


	const resp = await Modelo.find(obj)//se undefined, busca tudo no modelo
	// .collation({ locale: "pt", strength: 1 });

	if (!resp) {
		logger.info(`ERRO: Nada encontrado - ${req.user.SARAM}/${req.user.nome} - Busca: ${JSON.stringify(obj)}`);
		res.status(500);
		throw new Error();
	}

	//logger.info(`OK: Dados lidos - ${req.user.SARAM}/${req.user.nome} - Busca: ${JSON.stringify(obj)}`);
	return res.status(200).json(resp);
});



const atualizarDados = asyncHandler(async (req, res) => {
	const { Modelo, obj } = colecaoModelo(req, res);
	const id = obj._id;

	obj._id && delete obj._id;
	obj.id_demanda && delete obj.id_demanda;
	'__v' in obj && delete obj.__v;

	const docBeforeUpdate = await Modelo.findById(id);

	//------------------------------------------ EXCLUSÃO DE ARQUIVO
	if (obj.arquivo_id === null) {
		delete obj.arquivo_id;
		obj.$unset = { arquivo_id: "" };//deletar chave desta coleção		
		req.query.id = docBeforeUpdate.arquivo_id;
		req.query.modo = 'metadados';
		await deletarArquivo(req);//deletar arquivo e objeto BD
	}//--------------------------------------------------------------

	if (docBeforeUpdate.arquivo_id && obj.arquivo_id) {//se houver arquivo antes e depois
		if (docBeforeUpdate.arquivo_id.toString() !== obj.arquivo_id.toString()){//se houver mudança de arquivo
			req.query.id = docBeforeUpdate.arquivo_id;
			req.query.modo = 'metadados';
			await deletarArquivo(req);//deletar arquivo antigo
		}
	}

	// if (Modelo.modelName === 'Gerais') {
	// 	if (obj.arquivo_id) obj.expireAt = null;// se inserir arquivo, não expira mais
	// 	else obj.expireAt = new Date(Date.now() + (30 * 24 - 3) * 60 * 60 * 1000);// se remover, expira em 30 dias a partir da data de remoção
	// }

	const resp = await Modelo.findByIdAndUpdate(id, obj, { new: true, runValidators: true });
	//new: true: Retorna o documento atualizado após a atualização.
	//runValidators: true: Garante que as validações do esquema sejam aplicadas antes de executar a atualização.

	if (!resp) {
		logger.error(`Não atualizado - ${req.user.SARAM}/${req.user.nome} - Objeto proposto: ${JSON.stringify(obj)}`);
		res.status(500);
		throw new Error('Erro interno do servidor ao atualizar objeto!');
	}

	logger.info(`OK: Objeto atualizado (${docBeforeUpdate._id}) - ${req.user.SARAM}/${req.user.nome}`);
	logger.info(`Objeto antigo: ${JSON.stringify(docBeforeUpdate)}`);
	logger.info(`Objeto novo: ${JSON.stringify(resp)}`);
	return res.status(201).json(resp);
});



const deletarDados = asyncHandler(async (req, res) => {
	const { Modelo, obj } = colecaoModelo(req, res);//obj = filtro

	let deletado_por = obj.deletado_por;
	delete obj.deletado_por;


	const objEncontrados = await Modelo.find(obj);//primeiro busca, pois Admin pode excluir vários

	for (let i = 0; i < objEncontrados.length; i++) {
		const arquivo_id = objEncontrados[i].arquivo_id;
		if (arquivo_id) {
			req.query.id = arquivo_id;
			req.query.modo = 'metadados';
			await deletarArquivo(req);//deletar arquivo e objeto BD
		}
	}

	const resp = await Modelo.deleteMany(obj);
	const ojbDeletados = resp.deletedCount;

	if (ojbDeletados === 0) {
		logger.error(`Nenhum objeto encontrado para exclusão - ${req.user.SARAM}/${req.user.nome} - Filtro: ${JSON.stringify(obj)}`);
		res.status(404);
		throw new Error(`Nenhum objeto encontrado para exclusão.`);

	}

	logger.warn(`OK: ${ojbDeletados} objeto(s) deletado(s) - ${req.user.SARAM}/${req.user.nome} - Filtro: ${JSON.stringify(obj)}`);
	logger.info(`Objeto(s) antes de deletar: ${JSON.stringify(objEncontrados)}`);

	console.log(`\n${deletado_por} deletou ${ojbDeletados} objetos(s):\n${JSON.stringify(obj)}\n`);

	return res.status(204).json({ message: `${ojbDeletados} objetos(s) deletados com sucesso!` });
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