const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");
const User = require('./userModel')

const laSchema = mongoose.Schema({

	arquivo_id: {
		type: mongoose.Schema.Types.ObjectId,
	},
	id_demanda: {
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
		required: true,
	},
	codigo_documento_bim: {
		type: String,
		trim: true,
		required: true,
	},
	fase_do_projeto: {
		type: String,
		trim: true,
		required: true,
	},
	disciplinas: {
		type: [String],
		validate: {
			validator: function (v) {
				return v.length > 0;
			},
			message: 'É necessário ter pelo menos uma disciplina!'
		}
	},

	obs_la: {
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

module.exports = getModel('bibliotecatecnica', 'LA', laSchema, 'las');