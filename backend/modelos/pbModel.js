const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const pbSchema = new mongoose.Schema({});

const PB = PEIs.discriminator("PB", pbSchema);

module.exports = PB;
