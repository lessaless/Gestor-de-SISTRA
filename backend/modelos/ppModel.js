const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const ppSchema = new mongoose.Schema({});

const PP = PEIs.discriminator("PP", ppSchema);

module.exports = PP;
