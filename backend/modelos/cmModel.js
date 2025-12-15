const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const cmSchema = new mongoose.Schema({});

const CM = PEIs.discriminator("CM", cmSchema);

module.exports = CM;
