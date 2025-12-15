const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const mrSchema = new mongoose.Schema({});

const MR = PEIs.discriminator("MR", mrSchema);

module.exports = MR;
