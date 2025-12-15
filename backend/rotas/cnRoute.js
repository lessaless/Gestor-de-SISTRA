const express = require("express");
const router = express.Router();

const { 
    lerCNs,
} = require("../controladores/cnController");


router.get("/buscarcns", lerCNs)


module.exports = router;