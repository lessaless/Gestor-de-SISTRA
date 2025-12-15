// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");
const User = require('./userModel');

const arquivoSchema = new mongoose.Schema({
    caminho: {
        type: String,
        required: true,
        unique: true
    },
    criado_por: {
        type: String,
        ref: User,
        required: true
    },
    downloads: {
        type: Number,
        required: true,
        default: 0
    },
    modificado_por: {
        type: String,
        ref: User,
        required: true,
        default: function () {
            return this.criado_por;
        }
    },
    tamanho: {
        type: String,
    },
    titulo_arquivo: {
        type: String,
        required: true
    },
    tipo: {
        type: String
    },
    visualizacoes: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: {
		currentTime: () => new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
		//BRT = UTC-3h00 (- h * min * seg * mseg)
	}/* createdAt e updatedAt automáticos */
})

// const Arquivo = mongoose.model('Arquivo', arquivoSchema);
const Arquivo = getModel('bibliotecatecnica', 'Arquivo', arquivoSchema, 'arquivos')

module.exports = Arquivo;