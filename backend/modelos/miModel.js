const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const miSchema = new mongoose.Schema({});

const MI = PEIs.discriminator("MI", miSchema);

module.exports = MI;
