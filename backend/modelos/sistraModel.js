// const mongoose = require("mongoose");
// const User = require('../modelos/userModel');
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");

// Definindo o subdocumento para os autores
const autorSchema = new mongoose.Schema({
	SARAM: {
		type: String,
		required: true
	},
	disciplina: {
		type: String,
		trim: true,
		required: true
	},
	nome_militar: {
		type: String,
		required: true,
		trim: true
	},
	om_autora: {
		type: String,
		required: true,
		trim: true
	},
	// especialidade: {
	// 	type: String,
	// 	trim: true,
	// 	required: false
	// },
});


const sistraGeraisSchema = mongoose.Schema({
	// id_demanda: {
	// 	type: String,
	// 	trim: true,
	// 	required: false,
	// },

	id_sistra_gerais: {
		type: String,
		trim: true,
		required: true
	},

	arquivo_id: {
		type: mongoose.Schema.Types.ObjectId,
	},

	data_ocorrencia: {
		type: Date,
		required: true,
	},
	data_envio_form: {
		type: Date,
		required: true,
	},

	natureza_atividade: {
		type: String,
		trim: true
	},

	dispensa_afastamento: {
		type: String,
		trim: true
	},

	agente_causador: {
		type: String,
		trim: true
	},
	situacao_geradora: {
		type: String,
		trim: true
	},
	parte_do_corpo_atingida: {
		type: String,
		trim: true
	},
	foi_aberto_sindicancia: {
		type: String,
		trim: true,
		required: true
	},
	foi_feito_aso: {
		type: String,
		trim: true,
		required: true
	},

	// ================= //
	// Campos para texto
	// ================= //
	descricao_gerais: {
		type: String,
		trim: true,
		required: true
	},
	causa_gerais: {
		type: String,
		trim: true,
		required: true
	},
	descricao_dispensa: {
		type: String,
		trim: true,
		required: true
	},
	local_ocorrencia: {
		type: String,
		trim: true,
		required: true
	},

	recomendacoes_csmt: {
		type: String,
		trim: true,
		required: true
	},
	recomendacoes_cipa: {
		type: String,
		trim: true,
		required: true
	},
	acoes_treinamentos: {
		type: String,
		trim: true,
		required: true
	},
	// ================= //
	// Fim para Campos texto
	// ================= //
	palavras_chave: {
		type: Array,
		validate: {
			validator: function (v) {
				return v.length > 2;
			},
			message: 'É necessário ter pelo menos 3 palavras-chaves!'
		}
	},
	
	periodo_elaboracao: {
		type: Number,
		required: false
	},
	disciplinasAutores: {
		type: [autorSchema],
		validate: {
			validator: function (v) {
				return v.length > 0;
			},
			message: 'É necessário ter pelo menos uma disciplina com responsável!'
		}
	},
	// disciplinas: {
	// 	type: [String],
	// 	validate: {
	// 		validator: function (v) {
	// 			return v.length > 0;
	// 		},
	// 		message: 'É necessário ter pelo menos uma disciplina!'
	// 	}
	// },


	//automáticos
	criado_por: {
		type: String,
		ref: 'User',
		required: true,
	},
	modificado_por: {
		type: String,
		ref: 'User',
		required: true,
		default: function () {
			return this.criado_por;
		}
	},
	/* expireAt: {
		type: Date
	} */
}, {
	timestamps: {
		currentTime: () => new Date(Date.now() - 3 * 60 * 60 * 1000)/* .toISOString() */
		//BRT = UTC-3h00 (- h * min * seg * mseg)
	}/* createdAt e updatedAt automáticos */
}, {
	optimisticConcurrency: true//otimização de concorrência (atualizar mesmo arquivo, por exemplo, tardiamente)
})

// Criar índice de texto nos campos mais relevantes
// sistraGeraisSchema.index({
// 	// titulo_doc: "text",
// 	id_gerais: "text",
// 	id_demanda: "text",
// 	palavras_chave: "text",
// 	obs_gerais: "text",
// 	om_autora: "text"
// }, {
// 	default_language: "portuguese", // Definindo o idioma padrão como português
// });

// Criar o índice TTL (time to live) no campo expireAt
// geraisSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 /* após a data em expireAt */ });//se não criar o índice ele não exclui automaticamente

// geraisSchema.pre('save', function (next) {
// 	this.expireAt = new Date(Date.now() + (30 * 24 - 3) * 60 * 60 * 1000); // 30 dias a partir de agora
// 	next();
// });

// const Gerais = mongoose.model("Gerais", geraisSchema)
const SistraGerais = getModel('sistra', 'SistraGerais', sistraGeraisSchema, 'sistragerais');
// const constExport = getModel('db_name', 'model_name', 'schema_name', 'collection_name')
module.exports = SistraGerais;