const express = require("express");
const router = express.Router();

const { 
    lerStatus,
} = require("../controladores/statusController");


router.get("/buscarstatus", lerStatus)


module.exports = router;