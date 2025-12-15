const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const cfSchema = new mongoose.Schema({});

const CF = PEIs.discriminator("CF", cfSchema);

module.exports = CF;
