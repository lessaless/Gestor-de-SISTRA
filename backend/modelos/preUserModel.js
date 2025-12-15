// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");

const preUserSchema = mongoose.Schema({
    // ----------------------------------- Usuário preenche
    nome: {
        type: String,
        required: [true, "Por favor, adicione um nome!"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Por favor, adicione um email!"],
        unique: true,
        trim: true,
        match: [
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
            "Por favor, insira um email válido!"
        ]
    },
    cpf: {
        type: String,
        required: [true, "Por favor adicione um CPF"],
        unique: true
    },
    SARAM: {
        type: String,
        required: [true, "Por favor, adicione um SARAM!"],
        unique: true
    },
    OM: {
        type: String,
        trim: true,
    },
    posto: {
        type: String,
        required: [true, "Por favor, adicione um posto!"],
        trim: true,
    },
    quadro: {
        type: String,
        trim: true,
        /* maxLength: [8, "Por favor, insira o quadro no formato de 8 letras"], */
    },
    esp: {
        type: String,
        trim: true,
    },
    ult_promo: {
        type: Date,
    },
    PoliticaDePrivacidade: {
        type: Boolean,
        required: [true, "Para continuar, é preciso estar de acordo com a Política de Privacidade!"]
    },

    // ----------------------------------- Sistema preenche
    Permissoes: {
        type: [String],
        default: ['competencias', 'biblioteca']
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        ref: 'Role',
        default: 'usuario_local'
    },//Referência para a Role e usar método populate

}, {
    timestamps: true,
})

// const userDB = mongoose.connection.useDb('biblioteca');

const PreUser = getModel('biblioteca', "PreUser", preUserSchema, 'preusers')
module.exports = PreUser