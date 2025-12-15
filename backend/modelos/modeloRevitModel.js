const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");
const User = require('./userModel')

const modeloRevitSchema = mongoose.Schema({

	arquivo_id: {
		type: mongoose.Schema.Types.ObjectId,
	},
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
		trim: true,
	},
	
	obs_modelo_revit: {
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

module.exports = getModel('bibliotecatecnica', 'ModeloRevit', modeloRevitSchema, 'modelosrevit');