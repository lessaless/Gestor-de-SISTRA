const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const preenchimentoSchema = mongoose.Schema({
	SARAM: {
		type: String,
		required: [true, "Por favor adicione um SARAM, se não possuir SARAM insira 'Civil - Nome e Sobrenome"]
	},
	lastUpdatedCollection: {
		type: String,
		trim: true,
	},
	lastUpdatedDate: {
		type: Date,
	},
}, {
	timestamps: true,
})

module.exports = getModel('biblioteca', 'Preenchimento', preenchimentoSchema, 'preenchimentos');