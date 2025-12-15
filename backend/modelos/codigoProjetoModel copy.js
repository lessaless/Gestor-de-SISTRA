const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");
const User = require('../modelos/userModel')

const CodigoProjetoSchema = mongoose.Schema({

	arquivo_id: {
		type: mongoose.Schema.Types.ObjectId,
	},
	id_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	estado_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	benfeitoria: {
		type: String,
		trim: true,
		required: false,
	},
	localidade_demanda: {
		type: String,
		trim: true,
	},
	
	fase_do_projeto: {
		type: String,
		trim: true,
	},
	data_doc: {
		type: Date,
		required: false,
	},
	obs_prj: {
		type: String,
		trim: true,
	},
	codigo_bim: {
		type: String,
		trim: true,
		required:true,
		unique: true
	},
	sequencia_numerica: {
		type: String,
		required: true,
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

module.exports = getModel('bibliotecatecnica', 'CodigoProjeto', CodigoProjetoSchema, 'codigoprojetos');