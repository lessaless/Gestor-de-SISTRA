const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const houveDispensaSchema = mongoose.Schema({
	
	descricao: {
		type: String,
		required: true
	}
});

module.exports = getModel('sistra', 'HouveDispensa', houveDispensaSchema, 'houvedispensa');