const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const maSchema = new mongoose.Schema({});

const MA = PEIs.discriminator("MA", maSchema);

module.exports = MA;
