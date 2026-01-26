const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const gravidadeAcidenteSchema = mongoose.Schema({
	gravidade_acidente: {
		type: String,
		required: true
	},
	// area_atuacao: {
	// 	type: String,
	// 	required: false
	// }
}, {
	timestamps: true
})

module.exports = getModel('sistra', 'GravidadeAcidente', gravidadeAcidenteSchema, 'gravidadeacidente');