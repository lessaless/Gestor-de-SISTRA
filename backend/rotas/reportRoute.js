const express = require("express");
const { registrarReport, lerReports, atualizarReports, enviarEmailReport } = require("../controladores/reportController");
const router = express.Router();

const protectAdmin = require("../middleWare/adminMiddleware");

router.post("/addreport", registrarReport);
router.get("/lerreports", protectAdmin(), lerReports);
router.patch("/atualizarreports", protectAdmin(), atualizarReports)
router.post("/enviaremailreport", protectAdmin(), enviarEmailReport)


module.exports = router;