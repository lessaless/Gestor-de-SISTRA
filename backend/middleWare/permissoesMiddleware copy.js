const asyncHandler = require("express-async-handler");
const User = require("../modelos/userModel");
const Role = require("../modelos/roleModel");//Não pode remover, mesmo não usando de forma explícita
const { objModelos } = require('../utils/modelosMongo/modelosMongo');
const logger = require("../utils/logs/logger");

const gerarChave = (userReq, userBD, objeto, operacao) => {

    let ePropria = false;
    let eLocal = false;
    let chavePermissao = operacao;

    if (operacao === "cadastramento") {
        if (userReq.OM) {//se tiver OM na requisição
            // console.log("O valor de objeto:", objeto)
            if (userReq.OM === userBD.OM) eLocal = true;//checa se não foi alterada em relação ao BD
            else eLocal = false;//se foi alterada, sobe o privilégio
        } else eLocal = true;//se não tem na requisição, valida

    }
    else if (["edicao", "remocao"].includes(operacao)) {
        // console.log("O valor de userDB:", userBD)
        // console.log("O valor de objeto:", objeto)
        ePropria = objeto.criado_por.toString() === userBD.SARAM.toString();
        eLocal = objeto.om_autora === userBD.OM;
        chavePermissao += ePropria ? "_propria" : "";

    } else {//alterarpermissao
        chavePermissao = objeto.acao;//setaradmin, removeradmin
        eLocal = objeto.pessoa.OM === userBD.OM;

    }

    chavePermissao += eLocal ? "_local" : "_geral";

    return chavePermissao;
}


// Middleware para verificar permissões
const checarPermissao = (operacao) => {

    return asyncHandler(async (req, res, next) => {

        const userReq = req.user;

        let filtro = req.query.filtro;// requisições GET e DELETE
        if (typeof filtro === "string") {
            try {
                filtro = JSON.parse(filtro);
            } catch (error) {
                filtro = {};
            }
        } else if (typeof filtro !== "object" || filtro === null) {
            filtro = {};
        }

        const obj = req.body;// requisições POST e PATCH

        const id = ['PATCH', 'POST', 'PUT'].includes(req.method) ? obj._id : filtro._id;

        const colecao = obj?.colecao || req.query.colecao;
        const Modelo = objModelos[colecao]?.modelo;


        try {

            //como no modelo User foi definido ref: 'Role', o populate traz os dados da Role no mesmo objeto
            // Ex.: Se em userBD.role = "admin_geral", após o populate,
            // userBD.role = { _id: "admin_geral", permissions: [...permissoes] }

            const userBD = await User.findById(userReq._id).populate('role');
            console.log("Valor de userBD é", userBD)
            req.user = userBD;
            // const userBD = userReq.populate('role');

            if (!userBD) {
                logger.error(`Usuário (${userBD}) não encontrado para o ID ${userReq._id}`);
                res.status(403);
                throw new Error("Usuário não encontrado!");
            }

            const permissoes = userBD.role?.permissions || [];

            if (operacao === "leitura") {

                if (permissoes.includes("leitura_geral")) return next();

                if (userBD.role?.permissions.includes("leitura_local")) {
                    req.query.filtro = JSON.stringify({ ...filtro, om_autora: userBD.OM });
                    return next();
                }

                if (userBD.role?.permissions.includes("leitura_propria_local")) {
                    req.query.filtro = JSON.stringify({ ...filtro, om_autora: userBD.OM, criado_por: userBD.SARAM });
                    return next();
                }

                res.status(403);
                throw new Error("Acesso negado para essa operação.");
            }

            if (operacao === "verusuarios") {
                if (userBD.role?._id === "admin_geral" || userBD.role?._id === "admin_local") return next();
                else {
                    res.status(403);
                    throw new Error("Acesso negado para essa operação.");
                }
            }

            const objeto = await Modelo?.findById(id) || obj;

            const chavePermissao = gerarChave(userReq, userBD, objeto, operacao);

            if (!permissoes.includes(chavePermissao)) {
                logger.error(`Acesso negado! Permissão necessária: ${chavePermissao} - ${userBD.SARAM}/${userBD.nome}`);
                res.status(403);
                throw new Error("Acesso negado para essa operação.");
            }

            logger.info(`Operação permitida: ${chavePermissao} - ${userBD.SARAM}/${userBD.nome}`);
            next();

        } catch (err) {
            next(err);

        }

    });

};

module.exports = checarPermissao;