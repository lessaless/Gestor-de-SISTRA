const express = require("express");
const router = express.Router();

const { 
    lerETPEs,
    buscarSolucoesPorETPE,
} = require("../controladores/etpeController");


router.get("/buscaretpes", lerETPEs)
router.get("/buscarsolucoes", buscarSolucoesPorETPE)


module.exports = router;