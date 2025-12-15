// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");

const municipioSchema = mongoose.Schema({
	municipio: {
		type: String,
		required: true
	}
}, {
	timestamps: true
})


// const municipioDB = mongoose.connection.useDb('dadosauxiliares');

const Municipio = getModel('dadosauxiliares', "Municipio", municipioSchema, "municipios")
module.exports = Municipio