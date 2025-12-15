const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const situacaoGeradoraSchema = mongoose.Schema({
	codigo: {
		type: String,
		required: true
	},
	situacaogeradora: {
		type: String,
		required: true
	}
}, {
	timestamps: true
})

module.exports = getModel('sistra', 'SituacaoGeradora', situacaoGeradoraSchema, 'situacaogeradora');