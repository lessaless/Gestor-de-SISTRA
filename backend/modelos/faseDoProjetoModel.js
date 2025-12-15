const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const fasedoProjetoSchema = mongoose.Schema({
	codigo: {
		type: String,
		required: true
	},
	titulo: {
		type: String,
		required: true
	}
}, {
	timestamps: true
})

module.exports = getModel('bimmandate', 'FaseDoProjeto', fasedoProjetoSchema, 'fases_projeto');