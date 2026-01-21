// const mongoose = require("mongoose");
const mongoose = require("../../db/connect");
const SistraGerais = require("../sistraModel");

const acidenteSchema = new mongoose.Schema({
    militar_acidentado: {
        type: String,
        trim: true
    },
    gravidade_acidente: {
        type: String,
        trim: true
    },
});

const Acidente = SistraGerais.discriminator('Acidente', acidenteSchema);

module.exports = Acidente;