const gerarCodigoProjetoBim = require("./gerarCodigoProjetoBim");
const gerarCodigoDocumentoBim = require("./gerarCodigoDocumentoBim");
const salvarCodigoProjeto = require("./salvarCodigoProjeto");

/**
 * Configuração dos tipos de documentos que geram códigos BIM
 */
const TIPOS_DOCUMENTO_BIM = {
	'EstudoTecnicoPreliminarDeEngenharia': {
		discriminatorKey: 'EstudoTecnicoPreliminarDeEngenharia',
		disciplina: 'GER',
		LL: 'EP'
	},
	'CadernoDeNecessidades': {
		discriminatorKey: 'CadernoDeNecessidades',
		disciplina: 'GER',
		LL: 'CN'
	},
	'NotaTecnica': {
		discriminatorKey: 'NotaTecnica',
		disciplina: 'GER',
		LL: 'NT'
	},
	'ParecerTecnico': {
		discriminatorKey: 'ParecerTecnico',
		disciplina: 'GER',
		LL: 'PT'
	},
	'RelatorioTecnico': {
		discriminatorKey: 'RelatorioTecnico',
		disciplina: 'GER',
		LL: 'RT'
	},
	'LaudoTecnico': {
		discriminatorKey: 'LaudoTecnico',
		disciplina: 'GER',
		LL: 'LT'
	},
	'OrdemTecnica': {
		discriminatorKey: 'OrdemTecnica',
		disciplina: 'GER',
		LL: 'OT'
	},
	'AP': {
		discriminatorKey: 'AP',
		disciplina: null,
		LL: 'AP'
	},
	'CF': {
		discriminatorKey: 'CF',
		disciplina: null,
		LL: 'CF'
	},
	'CM': {
		discriminatorKey: 'CM',
		disciplina: null,
		LL: 'CM'
	},
	'ET': {
		discriminatorKey: 'ET',
		disciplina: null,
		LL: 'ET'
	},
	'EV': {
		discriminatorKey: 'EV',
		disciplina: null,
		LL: 'EV'
	},
	'LA': {
		discriminatorKey: 'LA',
		disciplina: null,
		LL: 'LA'
	},
	'LS': {
		discriminatorKey: 'LS',
		disciplina: null,
		LL: 'LS'
	},
	'MA': {
		discriminatorKey: 'MA',
		disciplina: null,
		LL: 'MA'
	},
	'MC': {
		discriminatorKey: 'MC',
		disciplina: null,
		LL: 'MC'
	},
	'MD': {
		discriminatorKey: 'MD',
		disciplina: null,
		LL: 'MD'
	},
	'MDC': {
		discriminatorKey: 'MDC',
		disciplina: null,
		LL: 'MDC'
	},
	'MF': {
		discriminatorKey: 'MF',
		disciplina: null,
		LL: 'MF'
	},
	'MI': {
		discriminatorKey: 'MI',
		disciplina: null,
		LL: 'MI'
	},
	'MR': {
		discriminatorKey: 'MR',
		disciplina: null,
		LL: 'MR'
	},
	'NS': {
		discriminatorKey: 'NS',
		disciplina: null,
		LL: 'NS'
	},
	'NT': {
		discriminatorKey: 'NT',
		disciplina: null,
		LL: 'NT'
	},
	'OD': {
		discriminatorKey: 'OD',
		disciplina: null,
		LL: 'OD'
	},
	'PB': {
		discriminatorKey: 'PB',
		disciplina: null,
		LL: 'PB'
	},
	'PG': {
		discriminatorKey: 'PG',
		disciplina: null,
		LL: 'PG'
	},
	'PO': {
		discriminatorKey: 'PO',
		disciplina: null,
		LL: 'PO'
	},
	'PP': {
		discriminatorKey: 'PP',
		disciplina: null,
		LL: 'PP'
	},
	// 'PT': {
	// 	discriminatorKey: 'PT',
	// 	disciplina: null,
	// 	LL: 'PT'
	// },
	'RE': {
		discriminatorKey: 'RE',
		disciplina: null,
		LL: 'RE'
	},
	// 'RT': {
	// 	discriminatorKey: 'RT',
	// 	disciplina: null,
	// 	LL: 'RT'
	// },
	'TA': {
		discriminatorKey: 'TA',
		disciplina: null,
		LL: 'TA'
	},
	'TE': {
		discriminatorKey: 'TE',
		disciplina: null,
		LL: 'TE'
	},
	'TJ': {
		discriminatorKey: 'TJ',
		disciplina: null,
		LL: 'TJ'
	},
	'TM': {
		discriminatorKey: 'TM',
		disciplina: null,
		LL: 'TM'
	},
	'TR': {
		discriminatorKey: 'TR',
		disciplina: null,
		LL: 'TR'
	},
};

/**
 * Gera códigos BIM completos (projeto e documento) para um objeto
 * 
 * @param {Object} params - Parâmetros
 * @param {Object} params.obj - Objeto que será salvo (com id_demanda e opcionalmente fase_do_projeto)
 * @param {Object} params.demanda - Documento da demanda (opcional, será buscado se não fornecido)
 * @param {string} params.tipoDocumento - Tipo do documento (chave de TIPOS_DOCUMENTO_BIM)
 * @returns {Promise<Object>} Objeto atualizado com os códigos BIM
 */
const gerarCodigosBim = async ({ obj, demanda = null, tipoDocumento }) => {
	try {
		// Validação: precisa ter id_demanda
		if (!obj.id_demanda) {
			console.log("Documento sem id_demanda - não gerará códigos BIM");
			return obj;
		}

		// Validação: tipo de documento deve estar configurado
		if (!tipoDocumento || !TIPOS_DOCUMENTO_BIM[tipoDocumento]) {
			throw new Error(`Tipo de documento não configurado: ${tipoDocumento}`);
		}

		// Buscar demanda se não foi fornecida
		if (!demanda) {
			const Demanda = require("../../modelos/demandaModel");
			const mongoose = require("mongoose");

			// Verificar se id_demanda é um ObjectId válido ou string
			const isValidObjectId = mongoose.Types.ObjectId.isValid(obj.id_demanda) &&
				/^[0-9a-fA-F]{24}$/.test(obj.id_demanda);

			if (isValidObjectId) {
				demanda = await Demanda.findById(obj.id_demanda);
			} else {
				demanda = await Demanda.findOne({ id_demanda: obj.id_demanda });
			}

			if (!demanda) {
				throw new Error(`Demanda não encontrada: ${obj.id_demanda}`);
			}
		}

		// Validação: demanda precisa ter os campos necessários
		if (!demanda.estado_demanda || !demanda.localidade_demanda || !demanda.benfeitoria_bim) {
			throw new Error("Demanda não possui todos os campos necessários (estado, localidade, benfeitoria)");
		}

		// ✅ NOVO: Determinar a fase a ser usada
		// Prioridade: 1) obj.fase_do_projeto (do formulário), 2) default da configuração
		const faseDoProjetoUsada = obj.fase_do_projeto;

		// ============================================ //
		// Inserindo a lógica de disciplina_principal...
		// ============================================ //
		// - If config has a hardcoded disciplina, use it (like 'GER' for ETPE and CN)
		// - Otherwise, use disciplina_principal from form or first from disciplinas array
		let disciplinaUsada;

		const configDisciplina = TIPOS_DOCUMENTO_BIM[tipoDocumento].disciplina;

		if (configDisciplina) {
			// Use hardcoded disciplina from config (ETPE and CN)
			disciplinaUsada = configDisciplina;
			console.log(`gerarCodigoBimController: Usando disciplina hardcoded: ${disciplinaUsada}`);
		} else {
			// Use disciplina_principal from form (AP and others)
			disciplinaUsada = obj.disciplina_principal;
			console.log("gerarCodigoBimController: Valor de disciplinaUsada é", disciplinaUsada)



			// Validation: disciplina is required for forms without hardcoded value
			if (!disciplinaUsada) {
				throw new Error(`gerarCodigoBimController: Disciplina Principal é obrigatória para ${tipoDocumento}`);
			}

			console.log(`gerarCodigoBimController: Usando disciplina do formulário: ${disciplinaUsada}`);
		}

		// ============================================ //
		// Fim da lógica de disciplina_principal...
		// ============================================ //
		console.log(`gerarCodigoBimController: Gerando códigos BIM para ${tipoDocumento} vinculado à demanda ${obj.id_demanda}`);
		console.log(` !CONTROLLER: Fase do projeto a ser usada: ${faseDoProjetoUsada} (origem: ${obj.fase_do_projeto ? 'formulário' : 'default'})`);

		// Gerar código projeto BIM (agora passa a fase)
		const { codigo_projeto_bim, sequencia_numerica, fase_do_projeto } = await gerarCodigoProjetoBim({
			estado_demanda: demanda.estado_demanda,
			localidade_demanda: demanda.localidade_demanda,
			benfeitoria: demanda.benfeitoria_bim,
			id_demanda: obj.id_demanda,
			fase_do_projeto: faseDoProjetoUsada  // ✅ Passa a fase selecionada
		});

		// Gerar código documento BIM (agora passa LL e disciplina da configuração)
		console.log(`gerarCodigoBimController: Preparando para chamar gerarCodigoDocumentoBim:`, {
			codigo_projeto_bim,
			tipoDocumento,
			discriminatorKey: TIPOS_DOCUMENTO_BIM[tipoDocumento].discriminatorKey,
			LL: TIPOS_DOCUMENTO_BIM[tipoDocumento].LL,
			disciplina: disciplinaUsada
		});

		const { codigo_documento_bim, sequencia_numerica_nnn } = await gerarCodigoDocumentoBim({
			codigo_projeto_bim,
			tipoDocumento: TIPOS_DOCUMENTO_BIM[tipoDocumento].discriminatorKey,
			LL: TIPOS_DOCUMENTO_BIM[tipoDocumento].LL,
			disciplina: disciplinaUsada
		});

		// Atualizar objeto com os códigos gerados
		obj.codigo_projeto_bim = codigo_projeto_bim;
		obj.codigo_documento_bim = codigo_documento_bim;
		obj.sequencia_numerica = sequencia_numerica;
		obj.sequencia_numerica_nnn = sequencia_numerica_nnn;

		// Copiar dados da demanda
		obj.estado_demanda = demanda.estado_demanda;
		obj.localidade_demanda = demanda.localidade_demanda;
		obj.benfeitoria = demanda.benfeitoria_bim;
		obj.fase_do_projeto = fase_do_projeto;  // ✅ Usa a fase que foi realmente usada
		obj.disciplina = disciplinaUsada;
		obj.LL = TIPOS_DOCUMENTO_BIM[tipoDocumento].LL;

		// Salvar o código do projeto na coleção codigoprojetos
		await salvarCodigoProjeto({
			codigo_projeto_bim,
			codigo_documento_bim,
			estado_demanda: demanda.estado_demanda,
			localidade_demanda: demanda.localidade_demanda,
			benfeitoria: demanda.benfeitoria_bim,
			sequencia_numerica,
			sequencia_numerica_nnn,
			id_demanda: obj.id_demanda,
			fase_do_projeto: fase_do_projeto,
			disciplina: disciplinaUsada
		});

		console.log(`gerarCodigoBimController: Códigos BIM gerados com sucesso: ${codigo_documento_bim} (fase: ${fase_do_projeto}, disciplina: ${disciplinaUsada})`);
		return obj;

	} catch (error) {
		console.error("gerarCodigoBimController: Erro ao gerar códigos BIM:", error);
		throw new Error("gerarCodigoBimController: Falha ao gerar códigos BIM: " + error.message);
	}
};

/**
 * Remove códigos BIM de um objeto
 * @param {Object} obj - Objeto a ser atualizado
 * @returns {Object} Objeto atualizado
 */
const removerCodigosBim = (obj) => {
	console.log("Removendo códigos BIM do documento");

	obj.codigo_projeto_bim = null;
	obj.codigo_documento_bim = null;
	obj.sequencia_numerica = null;
	obj.sequencia_numerica_nnn = null;
	obj.estado_demanda = null;
	obj.localidade_demanda = null;
	obj.benfeitoria = null;
	obj.fase_do_projeto = null;
	obj.LL = null;

	obj.$unset = {
		...obj.$unset,
		codigo_projeto_bim: "",
		codigo_documento_bim: "",
		sequencia_numerica: "",
		sequencia_numerica_nnn: "",
		estado_demanda: "",
		localidade_demanda: "",
		benfeitoria: "",
		fase_do_projeto: "",
		LL: ""
	};

	return obj;
};

/**
 * Determina o tipo de documento baseado no modelo
 * @param {Object} Modelo - Modelo do mongoose
 * @returns {string|null} Tipo do documento ou null se não aplicável
 */
const determinarTipoDocumento = (Modelo) => {
	const modelName = Modelo.modelName;
	const collectionName = Modelo.collection.name;

	// Mapeamento de modelos para tipos de documento
	const mapeamento = {
		// Por modelName (discriminator name)
		'Acidente': 'Acidente',
		'EstudoTecnicoPreliminarDeEngenharia': 'EstudoTecnicoPreliminarDeEngenharia',
		'CadernoDeNecessidades': 'CadernoDeNecessidades',
		'NotaTecnica': 'NotaTecnica',
		'ParecerTecnico': 'ParecerTecnico',
		'RelatorioTecnico': 'RelatorioTecnico',
		'LaudoTecnico': 'LaudoTecnico',
		'OrdemTecnica': 'OrdemTecnica',
		'AP': 'AP',
		'CF': 'CF',
		'CM': 'CM',
		'ET': 'ET',
		'EV': 'EV',
		'LA': 'LA',
		'LS': 'LS',
		'MA': 'MA',
		'MC': 'MC',
		'MD': 'MD',
		'MDC': 'MDC',
		'MF': 'MF',
		'MI': 'MI',
		'MR': 'MR',
		'NS': 'NS',
		'NT': 'NT',
		'OD': 'OD',
		'PB': 'PB',
		'PG': 'PG',
		'PO': 'PO',
		'PP': 'PP',
		'PT': 'PT',
		'RE': 'RE',
		'RT': 'RT',
		'TA': 'TA',
		'TE': 'TE',
		'TJ': 'TJ',
		'TM': 'TM',
		'TR': 'TR',

		// Por collection name (fallback)
		'gerais': (Modelo) => {
			if (Modelo.modelName === 'EstudoTecnicoPreliminarDeEngenharia') {
				return 'EstudoTecnicoPreliminarDeEngenharia';
			}
			if (Modelo.modelName === 'CadernoDeNecessidades') {
				return 'CadernoDeNecessidades';
			}
			if (Modelo.modelName === 'NotaTecnica') {
				console.log("Valor de Modelo.modelName é", Modelo.modelName)

				return 'NotaTecnica';
			}
			if (Modelo.modelName === 'ParecerTecnico') {
				console.log("Valor de Modelo.modelName é", Modelo.modelName)

				return 'ParecerTecnico';
			}
			if (Modelo.modelName === 'RelatorioTecnico') {
				console.log("Valor de Modelo.modelName é", Modelo.modelName)

				return 'RelatorioTecnico';
			}
			if (Modelo.modelName === 'LaudoTecnico') {
				console.log("Valor de Modelo.modelName é", Modelo.modelName)

				return 'LaudoTecnico';
			}
			if (Modelo.modelName === 'OrdemTecnica') {
				console.log("Valor de Modelo.modelName é", Modelo.modelName)

				return 'OrdemTecnica';
			}

			return null;
		},
		'sistragerais': (Modelo) => {
			if (Modelo.modelName === 'Acidente') {
				return 'Acidente';
			}
			return null;
		},
		'ap': (Modelo) => {
			if (Modelo.modelName === 'AP') {
				return 'AP';
			}
			return null;
		},
		'cf': (Modelo) => {
			if (Modelo.modelName === 'CF') {
				return 'CF';
			}
			return null;
		},
		'cm': (Modelo) => {
			if (Modelo.modelName === 'CM') {
				return 'CM';
			}
			return null;
		},
		'et': (Modelo) => {
			if (Modelo.modelName === 'ET') {
				return 'ET';
			}
			return null;
		},
		'ev': (Modelo) => {
			if (Modelo.modelName === 'EV') {
				return 'EV';
			}
			return null;
		},
		'la': (Modelo) => {
			if (Modelo.modelName === 'LA') {
				return 'LA';
			}
			return null;
		},
		'ls': (Modelo) => {
			if (Modelo.modelName === 'LS') {
				return 'LS';
			}
			return null;
		},
		'ma': (Modelo) => {
			if (Modelo.modelName === 'MA') {
				return 'MA';
			}
			return null;
		},
		'mc': (Modelo) => {
			if (Modelo.modelName === 'MC') {
				return 'MC';
			}
			return null;
		},
		'md': (Modelo) => {
			if (Modelo.modelName === 'MD') {
				return 'MD';
			}
			return null;
		},
		'mdc': (Modelo) => {
			if (Modelo.modelName === 'MDC') {
				return 'MDC';
			}
			return null;
		},
		'mf': (Modelo) => {
			if (Modelo.modelName === 'MF') {
				return 'MF';
			}
			return null;
		},
		'mi': (Modelo) => {
			if (Modelo.modelName === 'MI') {
				return 'MI';
			}
			return null;
		},
		'mr': (Modelo) => {
			if (Modelo.modelName === 'MR') {
				return 'MR';
			}
			return null;
		},
		'ns': (Modelo) => {
			if (Modelo.modelName === 'NS') {
				return 'NS';
			}
			return null;
		},
		'nt': (Modelo) => {
			if (Modelo.modelName === 'NT') {
				return 'NT';
			}
			return null;
		},
		'od': (Modelo) => {
			if (Modelo.modelName === 'OD') {
				return 'OD';
			}
			return null;
		},
		'pb': (Modelo) => {
			if (Modelo.modelName === 'PB') {
				return 'PB';
			}
			return null;
		},
		'pg': (Modelo) => {
			if (Modelo.modelName === 'PG') {
				return 'PG';
			}
			return null;
		},
		'po': (Modelo) => {
			if (Modelo.modelName === 'PO') {
				return 'PO';
			}
			return null;
		},
		'pp': (Modelo) => {
			if (Modelo.modelName === 'PP') {
				return 'PP';
			}
			return null;
		},
		// 'pt': (Modelo) => {
		//     if (Modelo.modelName === 'PT') {
		//         return 'PT';
		//     }
		//     return null;
		// },
		're': (Modelo) => {
			if (Modelo.modelName === 'RE') {
				return 'RE';
			}
			return null;
		},
		'rt': (Modelo) => {
			if (Modelo.modelName === 'RT') {
				return 'RT';
			}
			return null;
		},
		'ta': (Modelo) => {
			if (Modelo.modelName === 'TA') {
				return 'TA';
			}
			return null;
		},
		'te': (Modelo) => {
			if (Modelo.modelName === 'TE') {
				return 'TE';
			}
			return null;
		},
		'tj': (Modelo) => {
			if (Modelo.modelName === 'TJ') {
				return 'TJ';
			}
			return null;
		},
		'tm': (Modelo) => {
			if (Modelo.modelName === 'TM') {
				return 'TM';
			}
			return null;
		},
		'tr': (Modelo) => {
			if (Modelo.modelName === 'TR') {
				return 'TR';
			}
			return null;
		},


		// Aliases para facilitar
		'ETPE': 'EstudoTecnicoPreliminarDeEngenharia',
		'estudotpengenharia': 'EstudoTecnicoPreliminarDeEngenharia',
		'CN': 'CadernoDeNecessidades',
		'cadernodenecessidades': 'CadernoDeNecessidades',
		'notatecnica': 'NotaTecnica',
		'NT': 'NotaTecnica',
		'parecertecnico': 'ParecerTecnico',
		'PT': 'ParecerTecnico',
		'relatoriotecnico': 'RelatorioTecnico',
		'RT': 'RelatorioTecnico',
		'laudotecnico': 'LaudoTecnico',
		'LT': 'LaudoTecnico',
		'ordemtecnica': 'OrdemTecnica',
		'OT': 'OrdemTecnica',
		'ap': 'AP',
		'cf': 'CF',
		'cm': 'CM',
		'et': 'ET',
		'ev': 'EV',
		'la': 'LA',
		'ls': 'LS',
		'ma': 'MA',
		'mc': 'MC',
		'md': 'MD',
		'mdc': 'MDC',
		'mf': 'MF',
		'mi': 'MI',
		'mr': 'MR',
		'ns': 'NS',
		'nt': 'NT',
		'od': 'OD',
		'pb': 'PB',
		'pg': 'PG',
		'po': 'PO',
		'pp': 'PP',
		'pt': 'PT',
		're': 'RE',
		'rt': 'RT',
		'ta': 'TA',
		'te': 'TE',
		'tj': 'TJ',
		'tm': 'TM',
		'tr': 'TR',
	};

	// Tentar pelo modelName primeiro
	if (mapeamento[modelName]) {
		const resultado = typeof mapeamento[modelName] === 'function'
			? mapeamento[modelName](Modelo)
			: mapeamento[modelName];

		if (resultado) {
			console.log(`Tipo de documento identificado: ${resultado} (via modelName: ${modelName})`);
			return resultado;
		}
	}

	// Tentar pelo collectionName
	if (mapeamento[collectionName]) {
		const resultado = typeof mapeamento[collectionName] === 'function'
			? mapeamento[collectionName](Modelo)
			: mapeamento[collectionName];

		if (resultado) {
			console.log(`Tipo de documento identificado: ${resultado} (via collectionName: ${collectionName})`);
			return resultado;
		}
	}

	console.log(`Tipo de documento não identificado para modelo: ${modelName} (collection: ${collectionName})`);
	return null;
};

module.exports = {
	gerarCodigosBim,
	removerCodigosBim,
	determinarTipoDocumento,
	TIPOS_DOCUMENTO_BIM
};