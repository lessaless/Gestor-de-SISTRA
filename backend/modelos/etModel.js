const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const etSchema = new mongoose.Schema({});

const ET = PEIs.discriminator("ET", etSchema);

module.exports = ET;
