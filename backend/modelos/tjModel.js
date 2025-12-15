const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const tjSchema = new mongoose.Schema({});

const TJ = PEIs.discriminator("TJ", tjSchema);

module.exports = TJ;
