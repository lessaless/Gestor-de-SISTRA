const express = require("express");
const router = express.Router();

const { 
    lerGerenciamentoProj,
} = require("../controladores/gerenciamentoProjController");


router.get("/buscargerenciamentoproj", lerGerenciamentoProj)


module.exports = router;