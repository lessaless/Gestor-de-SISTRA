const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const benfeitoriaBimSchema = mongoose.Schema({
	codigo: {
		type: String,
		required: true
	},
	titulo: {
		type: String,
	}
}, {
	timestamps: true
})

module.exports = getModel('bimmandate', 'BenfeitoriaBim', benfeitoriaBimSchema, 'benfeitorias');