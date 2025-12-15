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


const geraisSchema = mongoose.Schema({
	id_demanda: {
		type: String,
		trim: true,
		required: false,
	},

	id_gerais: {
		type: String,
		trim: true,
		required: true
	},

	arquivo_id: {
		type: mongoose.Schema.Types.ObjectId,
	},

	titulo_doc: {
		type: String,
		trim: true,
		required: true,
	},

	data_doc: {
		type: Date,
		required: false,
	},

	doc_sigadaer: {
		type: String,
		trim: true
	},
	id_planinfra: {
		type: String,
		trim: true
	},

	data_sigadaer: {
		type: Date
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
	obs_gerais: {
		type: String,
		trim: true,
		required: false
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
	om_autora: {
		type: String,
		required: true
	},


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
geraisSchema.index({
	titulo_doc: "text",
	id_gerais: "text",
	id_demanda: "text",
	palavras_chave: "text",
	obs_gerais: "text",
	om_autora: "text"
}, {
	default_language: "portuguese", // Definindo o idioma padrão como português
});

// Criar o índice TTL (time to live) no campo expireAt
// geraisSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 /* após a data em expireAt */ });//se não criar o índice ele não exclui automaticamente

// geraisSchema.pre('save', function (next) {
// 	this.expireAt = new Date(Date.now() + (30 * 24 - 3) * 60 * 60 * 1000); // 30 dias a partir de agora
// 	next();
// });

// const Gerais = mongoose.model("Gerais", geraisSchema)
const Gerais = getModel('bibliotecatecnica', 'Gerais', geraisSchema, 'gerais');
// const constExport = getModel('db_name', 'model_name', 'schema_name', 'collection_name')
module.exports = Gerais;