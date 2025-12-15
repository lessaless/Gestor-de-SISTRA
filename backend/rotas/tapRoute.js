const express = require("express");
const router = express.Router();

const { 
    lerTAPs,
} = require("../controladores/tapController");


router.get("/buscartaps", lerTAPs)


module.exports = router;