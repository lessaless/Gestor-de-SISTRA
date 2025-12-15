const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const mdSchema = new mongoose.Schema({});

const MD = PEIs.discriminator("MD", mdSchema);

module.exports = MD;
