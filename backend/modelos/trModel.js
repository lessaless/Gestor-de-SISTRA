const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const trSchema = new mongoose.Schema({});

const TR = PEIs.discriminator("TR", trSchema);

module.exports = TR;
