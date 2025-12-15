const express = require("express");
const router = express.Router();

const checarPermissao = require("../middleWare/permissoesMiddleware");
const { alterarPermissao, obterUsuarios } = require("../controladores/permissaoController");

router.patch("/alterar", checarPermissao('alterarpermissao'), alterarPermissao);
router.get("/usuarios", checarPermissao('verusuarios'), obterUsuarios);
router.get("/autorizar", checarPermissao('verusuarios'), (req, res) => {
    res.status(200).end();//Liberar a página de permissões
});


module.exports = router;