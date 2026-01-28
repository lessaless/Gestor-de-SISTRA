const express = require("express");
const router = express.Router();
const User = require("../modelos/userModel.js");
const checarPermissao = require("../middleWare/permissoesMiddleware.js");
const authMiddleware = require("../middleWare/authMiddleware.js"); // Add your auth middleware
const crudAdminController = require("../controladores/crudAdminController.js");
const crudController = require("../controladores/crudController.js");

// Middleware para obter as funções do controlador com base nos privilégios do usuário
const qualController = async (req, res, next) => {
    const id = req.user._id;
    const user = await User.findById(id);
    const isAdmin = user.isAdmin;
    req.controller = isAdmin ? crudAdminController : crudController;
    next();
};

// Função para obter a função do controlador correspondente
const funcaoController = (nomeFuncao) => {
    return async (req, res, next) => {
        const { [nomeFuncao]: funcaoController } = await req.controller;
        return funcaoController(req, res, next);
    };
};

// All routes with proper middleware chain
router.post("/criar", 
    authMiddleware,
    checarPermissao('cadastramento'), 
    qualController, 
    funcaoController('criarDados')
);

router.get("/ler", 
    authMiddleware,
    checarPermissao("leitura"),  // ← Make sure this is uncommented!
    qualController, 
    funcaoController('lerDados')
);

router.patch("/atualizar", 
    authMiddleware,
    checarPermissao('edicao'), 
    qualController, 
    funcaoController('atualizarDados')
);

router.delete("/deletar", 
    authMiddleware,
    checarPermissao('remocao'), 
    qualController, 
    funcaoController('deletarDados')
);

module.exports = router;