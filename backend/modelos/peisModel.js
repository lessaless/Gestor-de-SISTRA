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
	// especialidade: {
	// 	type: String,
	// 	trim: true,
	// 	required: false
	// },
	tempo_gasto: {
		type: Number,
		required: false
	}
});

const peiSchema = mongoose.Schema({
	arquivo_id: {
		type: mongoose.Schema.Types.ObjectId,
	},
	id_demanda: {
		type: String,
		trim: true,
		required: false,
	},
	titulo_doc: {
		type: String,
		trim: true,
		required: true,
	},

	disciplina_principal: {
		type: String,
		trim: true,
		required: true,
	},
	
	codigo_projeto_bim: {
		type: String,
		trim: true,
		required: false,
	},
	codigo_documento_bim: {
		type: String,
		trim: true,
		required: false,
	},
	fase_do_projeto: {
		type: String,
		trim: true,
		required: true,
	},
	palavras_chave: {
		type: Array,
		validate: {
			validator: function (v) {
				return v.length > 2;
			},
			message: 'É necessário ter pelo menos 3 palavras-chaves!'
		}
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
	data_inicio_confecc_doc: {
		type: Date,
		required: true,
	},
	data_entrega_doc: {
		type: Date,
		required: true,
	},
	periodo_elaboracao: {
		type: Number,
		required: false
	},

	obs_pei: {
		type: String,
		trim: true,
	},
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
}, {
	timestamps: {
		currentTime: () => new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
		//BRT = UTC-3h00 (- h * min * seg * mseg)
	}/* createdAt e updatedAt automáticos */
}, {
	optimisticConcurrency: true
})



// Criar o índice TTL (time to live) no campo expireAt
// geraisSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 /* após a data em expireAt */ });//se não criar o índice ele não exclui automaticamente

// geraisSchema.pre('save', function (next) {
// 	this.expireAt = new Date(Date.now() + (30 * 24 - 3) * 60 * 60 * 1000); // 30 dias a partir de agora
// 	next();
// });

// const Gerais = mongoose.model("Gerais", geraisSchema)
const PEIs = getModel('bibliotecatecnica', 'PEIs', peiSchema, 'peis');
// const constExport = getModel('db_name', 'model_name', 'schema_name', 'collection_name')
module.exports = PEIs;