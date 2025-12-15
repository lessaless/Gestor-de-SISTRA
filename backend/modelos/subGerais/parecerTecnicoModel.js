// const mongoose = require("mongoose");
const mongoose = require("../../db/connect");
const Gerais = require("../geraisModel");

const parecerTecnicoSchema = new mongoose.Schema({
    estado_demanda: {
        type: String,
        trim: true,
        required: false,
    },
    localidade_demanda: {
        type: String,
        trim: true,
        required: false,
    },
    benfeitoria: {
        type: String,
        trim: true,
        required: false,
    },
    fase_do_projeto: {
        type: String,
        trim: true,
        required: false,
    },

    sequencia_numerica: {
        type: String,
        trim: true,
        required: false,
    },
    sequencia_numerica_nnn: {
        type: String,
        trim: true,
        required: false,
    },
    codigo_projeto_bim: {
        type: String,
        trim: true,
        required: false,
        unique: false
    },
    codigo_documento_bim: {
        type: String,
        trim: true,
        required: false,
        unique: false
    },
});

const ParecerTecnico = Gerais.discriminator('ParecerTecnico', parecerTecnicoSchema);

module.exports = ParecerTecnico;