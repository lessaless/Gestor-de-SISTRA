const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const odSchema = new mongoose.Schema({});

const OD = PEIs.discriminator("OD", odSchema);

module.exports = OD;
