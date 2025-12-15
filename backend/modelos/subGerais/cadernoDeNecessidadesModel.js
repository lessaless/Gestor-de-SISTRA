// const mongoose = require("mongoose");
const mongoose = require("../../db/connect");
const Gerais = require("../geraisModel");

const cadernoDeNecessidadesSchema = new mongoose.Schema({
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
    agente_causador_acidente: {
        type: String,
        trim: true,
        required: false,
    },
    sequencia_numerica: {
        type: String,
        trim: true,
        required: false,
    },
    LL: {
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
        unique: true,
        sparse: true
    },
    /* id_demanda: {
        type: String,
        trim: true,
        required: true,
    }, */ // passou para o modelo Gerais como opcional (se for exigir required, tratar no front)
    /* 
        data_doc_cn: {
            type: Date,
            required: true,
        }, */ // passou para o modelo Gerais como data_doc

    /* elo_cadastro: { // virou om_autora que é gerado automaticamente com base no user
        type: String,
        trim: true,
        required: true,
    }, */

});

const CadernoDeNecessidades = Gerais.discriminator('CadernoDeNecessidades', cadernoDeNecessidadesSchema);

module.exports = CadernoDeNecessidades;