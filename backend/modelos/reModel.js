const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const reSchema = new mongoose.Schema({});

const RE = PEIs.discriminator("RE", reSchema);

module.exports = RE;
