const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = require('../utils/validacaoArquivo/fileUploadPlus');

const protect = require("../middleWare/authMiddleware");


const { 
    baixarArquivo,
    buscarArquivo,
    uparArquivo
} = require("../controladores/arquivoController");


router.get("/baixar/:id", baixarArquivo);
router.get("/buscar/:id", buscarArquivo);
router.post("/upload", multer(upload).single('file'), uparArquivo)


module.exports = router;