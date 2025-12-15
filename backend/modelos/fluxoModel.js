const mongoose = require("mongoose");
const { getModel } = require("../db/multiDB");

const fluxoSchema = new mongoose.Schema({
  id_demanda: {
    type: String,
    unique: true,
    required: true
  },
  pecas_fluxo: [
    {
      _id: false,// evitar de criar _id automático para subdocumento

      colecao: {
        type: String,       // e.g. "demandas", "cns", "etpes"...
        required: true
      },
      refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      }
    }
  ]
}, { timestamps: true });

// module.exports = mongoose.model("Fluxo", fluxoSchema,);
module.exports = getModel('bibliotecatecnica', "Fluxo", fluxoSchema, 'fluxos');
// const FluxoDB = getModel('bibliotecatecnica');
// const A(estou exportando) = conexãoAoBancoDB.model("A(como registro)", nomeSchema, "nomeColecao")
// const Fluxo = FluxoDB.models.Fluxo ||
//   FluxoDB.model("Fluxo", fluxoSchema, "fluxos")
// module.exports = Fluxo

// const PLANINFRADB = getDB('bibliotecatecnica');
// // const A(estou exportando) = conexãoAoBancoDB.model("A(como registro)", nomeSchema, "nomeColecao")
// const PLANINFRA = PLANINFRADB.models.PLANINFRA ||
//   PLANINFRADB.model("PLANINFRA", planinfraSchema, "planinfras")
// module.exports = PLANINFRA
