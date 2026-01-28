const express = require("express");
const router = express.Router();
const User = require("../modelos/userModel.js");
const checarPermissao = require("../middleWare/permissoesMiddleware.js");
const crudAdminController = require("../controladores/crudAdminController.js");
const crudController = require("../controladores/crudController.js");

// Middleware para obter as funções do controlador com base nos privilégios do usuário
const qualController = async (req, res, next) => {
    // const id = req.user._id;
    // const isAdmin = (await User.findById(id)).isAdmin;
    const isAdmin = false;
    req.controller = isAdmin ? crudAdminController : crudController;
    next();
};

// Função para obter a função do controlador correspondente
const funcaoController = (nomeFuncao) => {
    return async (req, res, next) => {
        const { [nomeFuncao]: funcaoController } = await req.controller;
        // console.log("Passa por funcaoController", nomeFuncao)
        return funcaoController(req, res, next);
    };
};


router.post("/criar", checarPermissao('cadastramento'), qualController, funcaoController('criarDados'));
router.get("/ler", qualController, funcaoController('lerDados'));
// router.get("/ler", checarPermissao("leitura"), qualController, funcaoController('lerDados'));
router.patch("/atualizar", checarPermissao('edicao'), qualController, funcaoController('atualizarDados'));
router.delete("/deletar", checarPermissao('remocao'), qualController, funcaoController('deletarDados'));
//router.put("/substituir", qualController, funcaoController('substituirDados'));

module.exports = router;
