// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");

const terrenoSchema = mongoose.Schema({
	NR_TOMBO: {
		type: String,
		required: true
	},
	endereco: {
		type: String,
	}
}, {
	timestamps: true
})


// const terrenoDB = mongoose.connection.useDb('dadosauxiliares');

const Terreno = getModel('dadosauxiliares', "Terreno", terrenoSchema, "terrenos")
module.exports = Terreno