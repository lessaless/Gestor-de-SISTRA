const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const agenteCausadorAcidenteSchema = mongoose.Schema({
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

module.exports = getModel('sistra', 'AgenteCausadorAcidente', agenteCausadorAcidenteSchema, 'agentecausadoracidente');