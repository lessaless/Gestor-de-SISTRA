const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const mfSchema = new mongoose.Schema({});

const MF = PEIs.discriminator("MF", mfSchema);

module.exports = MF;
