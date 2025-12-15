// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");

const odsSchema = mongoose.Schema({
	ods: {
		type: String,
		required: true
	}
}, {
	timestamps: true
})


const odsDB = mongoose.connection.useDb('dadosauxiliares');

const Ods = getModel('dadosauxiliares', "Ods", odsSchema, "ods")
module.exports = Ods