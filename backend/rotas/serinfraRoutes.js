const express = require("express");
const router = express.Router();

const Serinfra = require("../modelos/serinfraModel");

// helper: normalize "AC/AM/RO/RR" -> ["AC","AM","RO","RR"]
function parseArea(area) {
  if (!area) return [];
  return String(area)
    .split(/[\/,;|]/g)          // split by / , ; |
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);
}

// GET /api/serinfra/by-uf/AC
router.get("/by-uf/:uf", async (req, res) => {
  try {
    const uf = String(req.params.uf || "").trim().toUpperCase();
    if (!uf || uf.length !== 2) {
      return res.status(400).json({ message: "UF inválida. Use uma sigla com 2 letras (ex.: SP)." });
    }

    const docs = await Serinfra.find({}, { serinfra: 1, area_atuacao: 1 }).lean();

    const match = docs.find(d => parseArea(d.area_atuacao).includes(uf));

    if (!match) {
      return res.status(404).json({ message: `Nenhuma SERINFRA encontrada para UF=${uf}.` });
    }

    return res.json({
      serinfra: match.serinfra,
      area_atuacao: match.area_atuacao,
      _id: match._id
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao buscar SERINFRA por UF." });
  }
});

// (Optional) GET list for caching on frontend
router.get("/", async (_req, res) => {
  try {
    const docs = await Serinfra.find({}, { serinfra: 1, area_atuacao: 1 }).lean();
    return res.json(docs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro ao listar SERINFRAS." });
  }
});

module.exports = router;
