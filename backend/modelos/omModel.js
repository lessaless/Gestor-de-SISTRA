// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");

const omSchema = mongoose.Schema({
	om: {
		type: String,
		required: true
	}
}, {
	timestamps: true
})


// const omDB = mongoose.connection.useDb('dadosauxiliares');

const Om = getModel('dadosauxiliares', "Om", omSchema, "oms")
module.exports = Om