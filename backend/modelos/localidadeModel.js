const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const localidadeSchema = mongoose.Schema({

	_id: {
		type: String,
		trim: true,
		required: false,
	},
	estado: {
		type: String,
		trim: true,
	},
	codigo: {
		type: String,
		trim: true,
		required: true,
	},

	
	OM_titulo: {
		type: String,
		trim: true,
		required: true,
	},
	
	OM_descricao: {
		type: String,
		trim: true,
	},
	__v: {
		type: String,
	},
}, {
	timestamps: true
})

module.exports = getModel('bimmandate', 'Localidade', localidadeSchema, 'localidades');