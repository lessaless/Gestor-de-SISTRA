const mongoose = require("mongoose");
const User = require('../modelos/userModel');
const { getModel } = require("../db/multiDB");

const TMPSchema = mongoose.Schema({

	id_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	codigo_bim: {
		type: String,
		trim: true,
		required: true,
	},
	tipo_doc: {
		type: String,
		trim: true,
	},
	data_doc: {
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
		
	criado_por: {
		type: String,
		ref: User,
		required: true,
	},
	obs_tmp: {
		type: String,
		trim: true,
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

module.exports = getModel('bibliotecatecnica', 'TMP', TMPSchema, 'tmps');