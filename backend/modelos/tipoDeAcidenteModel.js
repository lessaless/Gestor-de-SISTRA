const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const tipoDeAcidenteSchema = mongoose.Schema({
	
	tipo_de_acidente: {
		type: String,
		required: true
	}
});

module.exports = getModel('sistra', 'TipoDeAcidente', tipoDeAcidenteSchema, 'tipodeacidente');