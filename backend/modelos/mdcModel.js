const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const mdcSchema = new mongoose.Schema({});

const MDC = PEIs.discriminator("MDC", mdcSchema);

module.exports = MDC;
