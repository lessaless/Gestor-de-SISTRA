const express = require("express");
const router = express.Router();

const { 
    lerAPs,
} = require("../controladores/codigoBimController");


router.get("/buscartaps", lerTAPs)


module.exports = router;