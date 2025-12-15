const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");
const User = require('../modelos/userModel')

const demandaSchema = mongoose.Schema({

	arquivo_id: {
		type: mongoose.Schema.Types.ObjectId,
	},
	id_demanda: {
		type: String,
		trim: true,
		unique: true,
		required: true
	},
	titulo_demanda: {
		type: String,
		trim: true,
		required: [true, "Por favor, adicione um título para a demanda"]
	},
	apelido_demanda: {
		type: String,
		trim: true,
		required: [true, "Por favor, adicione um título para a demanda"]
	},
	tipo: {
		type: String,
		trim: true,
		required: true,
	},
	endereco_terreno: {
		type: String,
		trim: true,
		required: false,
	},
	propriedadeFAB: {
		type: String,
		trim: true,
		required: true,
	},
	terreno: {
		type: String,
		trim: true,
		/* required: true, */
	},
	om_solicitante: {
		type: String,
		trim: true,
		required: true,
	},
	// om_objeto: {
	// 	type: String,
	// 	trim: true,
	// 	required: true,
	// },
	fato_originador: {
		type: String,
		trim: true,
		required: true,
	},
	detalhe_fato_originador: {
		type: String,
		trim: true,
	},
	doc_sigadaer: {
		type: String,
		trim: true,
	},
	detalhes_despacho: {
		type: String,
		trim: true,
	},
	outro_fato_originador: {
		type: String,
		trim: true,
	},
	data_fato_originador: {
		type: Date,
		required: false,
	},
	ods_objeto: {
		type: String,
		trim: true,
		required: true,
	},
	apelido_localidade_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	apelido_benfeitoria: {
		type: String,
		trim: true,
		required: false,
	},
	benfeitoria_bim: {
		type: String,
		trim: true,
		required: true,
	},
	localidade_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	estado_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	cidade_demanda: {
		type: String,
		trim: true,
		required: true,
	},
	obs_demanda: {
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
	// status: {
	// 	type: String,
	// 	trim: true
	// },
}, {
	timestamps: {
		currentTime: () => new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
		//BRT = UTC-3h00 (- h * min * seg * mseg)
	}/* createdAt e updatedAt automáticos */
}, {
	optimisticConcurrency: true//otimização de concorrência (atualizar mesmo arquivo, por exemplo, tardiamente)
})

module.exports = getModel('bibliotecatecnica', 'Demanda', demandaSchema, 'demandas');