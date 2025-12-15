const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const poSchema = new mongoose.Schema({});

const PO = PEIs.discriminator("PO", poSchema);

module.exports = PO;
