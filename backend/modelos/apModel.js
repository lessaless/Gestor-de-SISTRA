const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const apSchema = new mongoose.Schema({});

const AP = PEIs.discriminator("AP", apSchema);

module.exports = AP;
