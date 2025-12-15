// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");
const User = require("./userModel");

const cnSchema = mongoose.Schema({

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
		unique: true,
		required: true
	},
	tipo_doc: {
		type: String,
		trim: true,
	},
	data_doc_cn: {
		type: Date,
		required: true,
	},
	doc_sigadaer: {
		type: String,
		trim: true,
	},
	id_planinfra: {
		type: String,
		trim: true,
	},
	data_sigadaer: {
		type: Date,
		trim: true,
	},
	status_cn: {
		type: String,
		trim: true,
	},
	elo_cadastro: {
		type: String,
		trim: true,
		required: true,
	},
	obs_cn: {
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

const CN = getModel('bibliotecatecnica', 'CN', cnSchema, 'cns')
module.exports = CN;