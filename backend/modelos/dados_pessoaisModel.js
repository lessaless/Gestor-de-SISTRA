const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const dados_pessoaisSchema = mongoose.Schema({
    SARAM: {
		type: String,
		required: [true, "Por favor adicione um SARAM, se não possuir SARAM insira 'Civil - Nome e Sobrenome"],
		unique: true
	},
	NOME_ARQUIVO: {
		type: String,
        trim: true,
	},
	RESUMO: {
		type: String,
		trim: true,
	},
	NOME: {
		type: String,
		trim: true,		
	},
	NOME_GUERRA: {
		type: String,
		trim: true,	
	},
	POSTO: {
		type: String,
		trim: true,
        maxLength: [5, "Por favor, insira o posto no formato de 2 letras"],
	},
	QUADRO: {
		type: String,
		trim: true,
		maxLength: [8, "Por favor, insira o quadro no formato de 5 letras"],
	},
	ESP: {
		type: String,
		trim: true,
		maxLength: [5, "Por favor, insira o posto no formato de 3 letras"],
	},
	VINCULO: {
		type: String,
		trim: true,
	},
	OM: {
		type: String,
		trim: true,
	},
	LINK: {
		type: String,
		trim: true,
	},
    FOTO: {
		type: Object,
		default: {}
    },
	ULT_PROMO: {
		type: Date,
	},
	ENT_CLASSE: {
		type: String,
		trim: true,	
	},
	INTERESSE : {
		type: String,
		trim: true,	
	},
	DISC: {
		type: String,
		trim: true,	
	},
	ESP_: {
		type: String,
		trim: true,	
	},
	Especialista: {
		type: String,
		trim: true,	
	},
	TEMPO_CONVOCADO: {
		type: Number,
		default: 0
	}
}, {
    timestamps: true, 
})

module.exports = getModel('biblioteca', 'Dados_pessoais', dados_pessoaisSchema, 'dados_pessoais');