const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const taSchema = new mongoose.Schema({});

const TA = PEIs.discriminator("TA", taSchema);

module.exports = TA;
