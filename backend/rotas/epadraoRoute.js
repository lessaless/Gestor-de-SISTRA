const express = require("express");
const router = express.Router();
// const protect = require("../middleWare/authMiddleware");
// const protectReports = require("../middleWare/reportMiddleware");

const { enviarMensagem } = require("../controladores/epadraoController");

router.post("/enviarmensagem", enviarMensagem);

module.exports = router;