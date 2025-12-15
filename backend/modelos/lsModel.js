const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const lsSchema = new mongoose.Schema({});

const LS = PEIs.discriminator("LS", lsSchema);

module.exports = LS;
