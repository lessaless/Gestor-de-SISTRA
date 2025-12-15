const express = require("express");
const router = express.Router();

const { 
    lerCodigosBim,
} = require("../controladores/codigoBimController");


router.get("/buscarcodigosbim", lerCodigosBim)


module.exports = router;