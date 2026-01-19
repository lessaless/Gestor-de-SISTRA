const mongoose = require("../db/connect")
const { getModel } = require("../db/multiDB");
const Role = require("../modelos/roleModel")

const userSchema = mongoose.Schema({
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
    /* senha: {
        type: String,
        required: [true, "Por favor, insira uma senha!"],
        minLength: [6, "Senha deve ter no mínimo 6 caracteres!"],
        maxLength: [100, "Senha deve ter no máximo 100 caracteres!"]
    }, */
    foto: {
        type: String,
        required: [true, "Por favor, adicione uma foto!"],
        default: "https:/i.ibb.co/4pDNDk1/avatar.png"
    },
    SARAM: {
        type: String,
        required: [true, "Por favor adicione um SARAM, se não possuir SARAM, insira 'Civil - Nome e Sobrenome!"],
        unique: true
    },
    cpf: {
        type: String,
        required: [true, "Por favor adicione um CPF"],
        unique: true
    },
    PoliticaDePrivacidade: {
        type: Boolean,
        required: [true, "Para continuar, é preciso estar de acordo com a Política de Privacidade!"]
    },
    Permissoes: {
        type: [String]
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    permissoesBiblioteca: {
        type: [String],
        default: []
    },
    OM: {
        type: String,
        trim: true,
    },
    role: { type: String, ref: 'Role' },//Referência para a Role e usar método populate
    

}, {
    timestamps: true,
})

module.exports = getModel('biblioteca', 'User', userSchema, 'users');