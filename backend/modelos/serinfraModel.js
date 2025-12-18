const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const serinfraSchema = mongoose.Schema({
	serinfra: {
		type: String,
		required: true
	},
	area_de_atuacao: {
		type: String,
		required: false
	}
}, {
	timestamps: true
})

module.exports = getModel('dadosauxiliares', 'Serinfra', serinfraSchema, 'serinfra');