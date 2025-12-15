const mongoose = require("mongoose");
const PEIs = require("./peisModel");

const nsSchema = new mongoose.Schema({

});


const NS = PEIs.discriminator('NS', nsSchema);

module.exports = NS;