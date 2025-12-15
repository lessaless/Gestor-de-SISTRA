const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const parteDoCorpoAtingidaSchema = mongoose.Schema({
	codigo: {
		type: String,
		required: true
	},
	descricao: {
		type: String,
		required: true
	}
}, {
	timestamps: true
})

module.exports = getModel('sistra', 'ParteDoCorpoAtingida', parteDoCorpoAtingidaSchema, 'partedocorpoatingida');