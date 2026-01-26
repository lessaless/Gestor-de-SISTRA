const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const tipoDeAcidenteSchema = mongoose.Schema({
	
	descricao: {
		type: String,
		required: true
	}
});

module.exports = getModel('sistra', 'TipoDeAcidente', tipoDeAcidenteSchema, 'tipodeacidente');