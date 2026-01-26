// const mongoose = require("mongoose");
// const User = require('../modelos/userModel');
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");

// // Definindo o subdocumento para os autores
// const autorSchema = new mongoose.Schema({
// 	SARAM: {
// 		type: String,
// 		required: true
// 	},
// 	disciplina: {
// 		type: String,
// 		trim: true,
// 		required: true
// 	},
// 	nome_militar: {
// 		type: String,
// 		required: true,
// 		trim: true
// 	},
// 	om_autora: {
// 		type: String,
// 		required: true,
// 		trim: true
// 	},
// 	// especialidade: {
// 	// 	type: String,
// 	// 	trim: true,
// 	// 	required: false
// 	// },
// });


const sistraGeraisSchema = mongoose.Schema({


	// =============== //
	// Início SISTRA //
	// =============== //
	id_sistra: {
		type: String,
		trim: true,
		required: true
	},

	agente_causador_acidente: {
		type: String,
		trim: true,
		required: false,
	},
	om_responsavel: {
		type: String,
		trim: true,
		required: false,
	},
	estado_demanda: {
		type: String,
		trim: true,
		required: false,
	},
	natureza_atividade: {
		type: String,
		trim: true
	},

	dispensa_afastamento: {
		type: String,
		trim: true
	},
	parte_do_corpo_atingida: {
		type: String,
		trim: true
	},
	status_final: {
		type: String,
		required: true
	},
	tipo_de_acidente: {
		type: String,
		required: true
	},
	dia_da_semana: {
		type: String,
		required: true
	},
	data_ocorrencia: {
		type: Date,
		required: true,
	},
	data_envio_form: {
		type: Date,
		required: true,
	},
	// =============== //
	// Fim SISTRA //
	// =============== //

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

	// recomendacoes_csmt: {
	//     type: String,
	//     trim: true,
	//     required: true
	// },
	// recomendacoes_cipa: {
	//     type: String,
	//     trim: true,
	//     required: true
	// },
	acoes_treinamentos: {
		type: String,
		trim: true,
		required: true
	},
	// ================= //
	// Fim para Campos texto
	// ================= //
	/* id_demanda: {
		type: String,
		trim: true,
		required: true,
	}, */ // passou para o modelo Gerais como opcional (se for exigir required, tratar no front)
	/* 
		data_doc_cn: {
			type: Date,
			required: true,
		}, */ // passou para o modelo Gerais como data_doc

	/* elo_cadastro: { // virou om_autora que é gerado automaticamente com base no user
		type: String,
		trim: true,
		required: true,
	}, */


	// disciplinasAutores: {
	// 	type: [autorSchema],
	// 	validate: {
	// 		validator: function (v) {
	// 			return v.length > 0;
	// 		},
	// 		message: 'É necessário ter pelo menos uma disciplina com responsável!'
	// 	}
	// },
	// //automáticos
	// criado_por: {
	// 	type: String,
	// 	ref: 'User',
	// 	required: true,
	// },
	// modificado_por: {
	// 	type: String,
	// 	ref: 'User',
	// 	required: true,
	// 	default: function () {
	// 		return this.criado_por;
	// 	}
	// },
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