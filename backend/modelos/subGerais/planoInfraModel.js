// const mongoose = require("mongoose");
const mongoose = require("../../db/connect");
const Gerais = require("../geraisModel");

const planoInfraSchema = new mongoose.Schema({
});

const PlanoInfra = Gerais.discriminator('PlanoInfra', planoInfraSchema);

module.exports = PlanoInfra;