// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB");

const preenchimentoSchema = mongoose.Schema({
  SARAM: {
    type: String,
    required: [true, "Por favor adicione um SARAM, se não possuir SARAM insira 'Civil - Nome e Sobrenome"]
  },
  lastUpdatedCollection: {
    type: String,
    trim: true,
  },
  lastUpdatedDate: {
    type: Date,
  },

  // New fields needed by politicaPrivacidadeMiddleware:
  PoliticaDePrivacidade: {
    type: Boolean,
    default: false,
  },
  dataAceitacaoPolitica: {
    type: Date,
  }

}, {
  timestamps: true,
});

// const bibliotecaDB = mongoose.connection.useDb('biblioteca');
const Preenchimento = getModel('biblioteca', "Preenchimento", preenchimentoSchema, "preenchimentos");

module.exports = Preenchimento;
