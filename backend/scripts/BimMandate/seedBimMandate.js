// scripts/seedBimMandateDoJSON.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const fs = require("fs");

// Use the same mongoose instance used by multiDB/connect
const mongoose = require("../../db/connect");
// Destructure the helpers exported by multiDB
const { getDb, getModel } = require("../../db/multiDB");

async function connect() {
  // If db/connect already opened a connection this is harmless;
  // otherwise this will open it. Uses the same mongoose instance.
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}

async function seedAll() {
  try {
    await connect();
    const bimmandateDB = getDb("bimmandate");

    // Schemas (use mongoose from ../../db/connect so it's the same instance)
    const localidadesSchema = new mongoose.Schema({
      estado: String,
      UF: String,
      codigo: String,
      OM_titulo: String,
      OM_descricao: String,
    });
    const benfeitoriaSchema = new mongoose.Schema({ codigo: String, titulo: String });
    const faseProjetoSchema = new mongoose.Schema({ codigo: String, titulo: String });
    const disciplinaSchema = new mongoose.Schema({
      codigo: String,
      titulo: String,
      subdisciplinas: [{ codigo: String, titulo: String }]
    });
    const tipoDocSchema = new mongoose.Schema({ codigo: String, titulo: String });

    // Models - create them on the correct DB connection using getModel
    const Localidade = getModel("bimmandate", "Localidade", localidadesSchema, "localidades");
    const Benfeitoria = getModel("bimmandate", "Benfeitoria", benfeitoriaSchema, "benfeitorias");
    const FaseProjeto = getModel("bimmandate", "FaseProjeto", faseProjetoSchema, "fases_projeto");
    const Disciplina = getModel("bimmandate", "Disciplina", disciplinaSchema, "disciplinas");
    const TipoDocumento = getModel("bimmandate", "TipoDocumento", tipoDocSchema, "tipos_documento");

    // ---------------------------
    // Lê os JSONs
    // ---------------------------
    const readJson = (filename) =>
      JSON.parse(fs.readFileSync(path.resolve(__dirname, "JSON", filename), "utf8"));

    const localidades = readJson("localidades.json");
    const benfeitorias = readJson("benfeitorias.json");
    const fases = readJson("fases_projeto.json");
    const disciplinas = readJson("disciplinas.json");
    const tiposDocumento = readJson("tipos_doc.json");

    // ---------------------------
    // Salvar no MongoDB
    // ---------------------------
    await Localidade.deleteMany({});
    await Benfeitoria.deleteMany({});
    await FaseProjeto.deleteMany({});
    await Disciplina.deleteMany({});
    await TipoDocumento.deleteMany({});

    await Localidade.insertMany(localidades);
    await Benfeitoria.insertMany(benfeitorias);
    await FaseProjeto.insertMany(fases);
    await Disciplina.insertMany(disciplinas);
    await TipoDocumento.insertMany(tiposDocumento);

    console.log("✅ Seed completo inserido no banco bimmandate!");
    console.log(
      `Localidades: ${localidades.length}, Benfeitorias: ${benfeitorias.length}, Fases: ${fases.length}, Disciplinas: ${disciplinas.length}, TiposDoc: ${tiposDocumento.length}`
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro no seed:", err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

seedAll();
