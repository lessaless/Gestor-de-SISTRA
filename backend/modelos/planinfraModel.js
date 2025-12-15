const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");
const User = require('../modelos/userModel')

const planinfraSchema = mongoose.Schema({

	id_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	id_cn: {
		type: String,
		trim: true,
		required: true,
		unique: true,
	},
	id_etpe: {
		type: String,
		trim: true,
		required: true,
		unique: true,
	},
	id_status: {
		type: String,
		trim: true,
		required: true,

	},
	id_origem_recurso: {
		type: String,
		trim: true,
		required: true,
	},
	id_responsavel_recurso: {
		type: String,
		required: true,
	},

	id_planinfra: {
		type: String,
		trim: true,
		required: true,
	},
	codigo_bim_planinfra: {
		type: String,
		trim: true,
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
	valor: {
		type: String,
		trim: true,
		required: true,
	},

	data_doc_etpe: {
		type: Date,
		required: true,
	},

	data_estimada_entrega_proj: {
		type: Date,
		required: false,
	},

	doc_sigadaer_entrega_proj: {
		type: String,
		trim: true,
	},
	data_sigadaer_proj: {
		type: Date,
		required: false,
	},
	estado_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	cidade_demanda: {
		type: String,
		trim: true,
		required: false,
	},
	localidade_demanda: {
		type: String,
		trim: true,
		required: true,
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

module.exports = getModel('bibliotecatecnica', 'PLANINFRA', planinfraSchema, 'planinfras');