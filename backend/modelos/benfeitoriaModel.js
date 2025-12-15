const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const benfeitoriaSchema = mongoose.Schema({
	id_benfeitoria: {
		type: String,
		required: true
	},
	apelido: {
		type: String,
	}
}, {
	timestamps: true
})

module.exports = getModel('dadosauxiliares', 'Benfeitoria', benfeitoriaSchema, 'benfeitorias');