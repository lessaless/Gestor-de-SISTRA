const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const naturezaDaAtividadeSchema = mongoose.Schema({
	
	descricao: {
		type: String,
		required: true
	}
});

module.exports = getModel('sistra', 'NaturezaDaAtividade', naturezaDaAtividadeSchema, 'naturezadaatividade');