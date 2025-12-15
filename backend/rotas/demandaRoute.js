const express = require("express");
const router = express.Router();

const { 
    criarDemanda,
    lerDemandas,
    lerFluxo
} = require("../controladores/fluxoController");


router.get("/buscardemandas", lerDemandas)
router.post("/criardemanda", criarDemanda)
router.get("/pecasdemanda", lerFluxo)


module.exports = router;