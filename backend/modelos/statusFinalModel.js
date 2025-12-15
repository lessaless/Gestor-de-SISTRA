const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const statusFinalSchema = mongoose.Schema({
	
	descricao: {
		type: String,
		required: true
	}
});

module.exports = getModel('sistra', 'StatusFinal', statusFinalSchema, 'statusfinal');