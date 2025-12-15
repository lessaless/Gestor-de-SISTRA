// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");

const reportSchema = mongoose.Schema({
	origem: {
		type: String,
		required: true
	},
    SARAM: {
		type: String,
		required: true
	},
	CATEGORIA: {
		type: String,
        trim: true
	},
	DESCRICAO: {
		type: String,
        trim: true
	},
	preferenciaContato: {
		type: String,
		trim: true
	},
	detalhesContato: {
		type: String,
		trim: true
	},
	resolvido: {
		type: Boolean
	}

}, {
	timestamps: {
		currentTime: () => new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
		//BRT = UTC-3h00 (- h * min * seg * mseg)
	}/* createdAt e updatedAt automáticos */
})


// const reportDB = mongoose.connection.useDb('biblioteca');

const Report = getModel('biblioteca', "Report", reportSchema, "reports")
module.exports = Report