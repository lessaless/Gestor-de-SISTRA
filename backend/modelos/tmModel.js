const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const tmSchema = new mongoose.Schema({});

const TM = PEIs.discriminator("TM", tmSchema);

module.exports = TM;
