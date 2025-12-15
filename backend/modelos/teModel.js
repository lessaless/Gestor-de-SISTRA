const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const teSchema = new mongoose.Schema({});

const TE = PEIs.discriminator("TE", teSchema);

module.exports = TE;
