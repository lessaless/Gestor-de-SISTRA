const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const evSchema = new mongoose.Schema({});

const EV = PEIs.discriminator("EV", evSchema);

module.exports = EV;
