// const mongoose = require("mongoose");
const mongoose = require("../../db/connect");
const Gerais = require("../geraisModel");

const solucaoSchema = new mongoose.Schema({
    nume_solucao: {
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'User',
        type: Number,
        required: true
    },
    valor_solucao: {
        type: Number,
        required: false
    },
    tempo_projeto_solucao: {
        type: Number,
        required: true
    },
    tempo_obra_solucao: {
        type: Number,
        required: true
    }
});

const estudoTPEngenhariaSchema = new mongoose.Schema({

    id_cn: {
        type: String,
        trim: true,
        required: true,
    },
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
    solucoes: {
        type: [solucaoSchema],
        validate: {
            validator: function (v) {
                return v.length > 0;
            },
            message: 'É necessário ter pelo menos uma solução!'
        }
    }

});

const EstudoTPEngenharia = Gerais.discriminator('EstudoTecnicoPreliminarDeEngenharia', estudoTPEngenhariaSchema);

module.exports = EstudoTPEngenharia;