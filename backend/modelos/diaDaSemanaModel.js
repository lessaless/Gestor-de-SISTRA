const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const diaDaSemanaSchema = mongoose.Schema({
	dia_da_semana: {
		type: String,
		required: true
	}
}, {
	timestamps: true
})

module.exports = getModel('dadosauxiliares', 'DiaDaSemana', diaDaSemanaSchema, 'diadasemana');