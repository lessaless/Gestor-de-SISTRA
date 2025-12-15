// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB")

const estadoSchema = mongoose.Schema({
	estado: {
		type: String,
		required: true
	}
}, {
	timestamps: true
})

const Estado = getModel('dadosauxiliares', "Estado", estadoSchema, "estados")
module.exports = Estado