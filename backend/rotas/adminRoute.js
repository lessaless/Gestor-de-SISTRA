const express = require("express");
const router = express.Router();

const protectAdmin = require("../middleWare/adminMiddleware");

const { getLogFiles, getLogFileContent, getPreCadastros, aprovarPreCadastro, removerPreCadastro} = require("../controladores/adminController")

//Verificar se é admin
router.get("/verificar", protectAdmin({soVerificar: true}), ((req, res) => {
    return res.status(200).json({ eAdmin: true }).end();
}));

router.get('/logs', protectAdmin(), getLogFiles);
router.get('/logs/:filename', protectAdmin(), getLogFileContent);

router.get('/precadastros', protectAdmin(), getPreCadastros)
router.post('/aprovarprecadastro', protectAdmin(), aprovarPreCadastro)
router.delete('/removerprecadastro', protectAdmin(), removerPreCadastro)



module.exports = router;