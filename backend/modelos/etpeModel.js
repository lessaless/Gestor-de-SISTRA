// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");
const User = require("./userModel");

// Definindo o subdocumento para os autores
const autorSchema = new mongoose.Schema({
	SARAM: {
		type: String,
		required: true
	},
	especialidade: {
		type: String,
		trim: true,
		required: false
	},
	tempo_gasto: {
		type: Number,
		required: false
	}
});



const solucaoSchema = new mongoose.Schema({
	nume_solucao: {
		// type: mongoose.Schema.Types.ObjectId,
		// ref: 'User',
		type: Number,
		required: true
	},
	valor_solucao: {
		type: Number,
		required: false
	},
	tempo_projeto_solucao: {
		type: Number,
		required: true
	},
	tempo_obra_solucao: {
		type: Number,
		required: true
	}
});

const etpeSchema = mongoose.Schema({

	arquivo_id: {
		type: mongoose.Schema.Types.ObjectId,
	},
	id_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	id_cn: {
		type: String,
		trim: true,
	},
	id_etpe: {
		type: String,
		trim: true,
		required: true,
		unique: true
	},
	data_doc_etpe: {
		type: Date,
		required: true,
	},
	doc_sigadaer: {
		type: String,
		trim: true,
	},
	data_sigadaer: {
		type: Date,
	},
	elo_resp: {
		type: String,
		trim: true,
		required: true,
	},

	autores: {
        type: [autorSchema],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'É necessário ter pelo menos um autor!'
        }
    },

	solucoes: {
        type: [solucaoSchema],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'É necessário ter pelo menos uma solução!'
        }
    },

	obs_etpe: {
		type: String,
		trim: true,
	},
	criado_por: {
		type: String,
		ref: User,
		required: true,
	},
	modificado_por: {
        type: String,
        ref: User,
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

const ETPE = getModel('bibliotecatecnica', "ETPE", etpeSchema, 'etpes')
module.exports = ETPE;