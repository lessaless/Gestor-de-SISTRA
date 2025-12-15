// const mongoose = require("mongoose");
const mongoose = require("../../db/connect");
const SistraGerais= require("../sistraModel");

const acidenteSchema = new mongoose.Schema({

});

const Acidente = SistraGerais.discriminator('Acidente', acidenteSchema);

module.exports = Acidente;