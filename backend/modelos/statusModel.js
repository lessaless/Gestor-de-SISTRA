// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");
const User = require("./userModel");

const statusSchema = mongoose.Schema({
	_id: {
		type: String,
		trim: true,
		required: true,
	},
	status: {
		type: String,
		trim: true,
		required: true,
	},
	
}, {
	timestamps: {
		currentTime: () => new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
		//BRT = UTC-3h00 (- h * min * seg * mseg)
	}/* createdAt e updatedAt automáticos */
}, {
	optimisticConcurrency: true
})

const STATUS = getModel('bibliotecatecnica', "STATUS", statusSchema, 'status')
module.exports = STATUS;