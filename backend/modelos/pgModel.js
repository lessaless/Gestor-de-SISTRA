const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const pgSchema = new mongoose.Schema({});

const PG = PEIs.discriminator("PG", pgSchema);

module.exports = PG;
