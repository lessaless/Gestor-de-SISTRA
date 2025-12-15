const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const mcSchema = new mongoose.Schema({});

const MC = PEIs.discriminator("MC", mcSchema);

module.exports = MC;
