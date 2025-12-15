const mongoose = require("mongoose");
const User = require('../modelos/userModel');
const { getModel } = require("../db/multiDB");

const gerenciamentoProjSchema = mongoose.Schema({

	id_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	data_alteracao_proj: {
		type: Date,
		required: true,
	},
	progresso:{
		type: String,
		trim: true,
		required: true
	},

	autores:{
		type: String,
		trim: true,
		required: false
	},
	obs_proj: {
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

module.exports = getModel('bibliotecatecnica', 'GerenciamentoProj', gerenciamentoProjSchema, 'gerenciamentoproj');