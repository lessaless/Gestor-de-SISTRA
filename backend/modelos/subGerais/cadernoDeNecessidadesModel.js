// const mongoose = require("mongoose");
const mongoose = require("../../db/connect");
const Gerais = require("../geraisModel");

const cadernoDeNecessidadesSchema = new mongoose.Schema({

    // localidade_demanda: {
    //     type: String,
    //     trim: true,
    //     required: false,
    // },
    // benfeitoria: {
    //     type: String,
    //     trim: true,
    //     required: false,
    // },
    // fase_do_projeto: {
    //     type: String,
    //     trim: true,
    //     required: false,
    // },
    agente_causador_acidente: {
        type: String,
        trim: true,
        required: false,
    },
    // sequencia_numerica: {
    //     type: String,
    //     trim: true,
    //     required: false,
    // },
    // LL: {
    //     type: String,
    //     trim: true,
    //     required: false,
    // },
    // sequencia_numerica_nnn: {
    //     type: String,
    //     trim: true,
    //     required: false,
    // },
    // codigo_projeto_bim: {
    //     type: String,
    //     trim: true,
    //     required: false,
    //     unique: false
    // },
    // codigo_documento_bim: {
    //     type: String,
    //     trim: true,
    //     required: false,
    //     unique: true,
    //     sparse: true
    // },
    // =============== //
    // Início SISTRA //
    // =============== //

    om_responsavel: {
        type: String,
        trim: true,
        required: false,
    },
    estado_demanda: {
        type: String,
        trim: true,
        required: false,
    },
    natureza_atividade: {
        type: String,
        trim: true
    },

    dispensa_afastamento: {
        type: String,
        trim: true
    },
    parte_do_corpo_atingida: {
        type: String,
        trim: true
    },
    status_final: {
        type: String,
        required: true
    },
    tipo_de_acidente: {
        type: String,
        required: true
    },
    dia_da_semana: {
        type: String,
        required: true
    },
    data_ocorrencia: {
        type: Date,
        required: true,
    },
    data_envio_form: {
        type: Date,
        required: true,
    },
    // =============== //
    // Fim SISTRA //
    // =============== //

    // ================= //
    // Campos para texto
    // ================= //
    descricao_gerais: {
        type: String,
        trim: true,
        required: true
    },
    causa_gerais: {
        type: String,
        trim: true,
        required: true
    },
    descricao_dispensa: {
        type: String,
        trim: true,
        required: true
    },
    local_ocorrencia: {
        type: String,
        trim: true,
        required: true
    },

    // recomendacoes_csmt: {
    //     type: String,
    //     trim: true,
    //     required: true
    // },
    // recomendacoes_cipa: {
    //     type: String,
    //     trim: true,
    //     required: true
    // },
    acoes_treinamentos: {
        type: String,
        trim: true,
        required: true
    },
    // ================= //
    // Fim para Campos texto
    // ================= //
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