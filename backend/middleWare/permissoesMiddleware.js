const asyncHandler = require("express-async-handler");
const User = require("../modelos/userModel");
const Role = require("../modelos/roleModel");//Não pode remover, mesmo não usando de forma explícita
const { objModelos } = require('../utils/modelosMongo/modelosMongo');
const logger = require("../utils/logs/logger");

const gerarChave = (userReq, userBD, objeto, operacao) => {

    let ePropria = false;
    let eLocal = false;
    let chavePermissao = operacao;

    console.log('=== GERAR CHAVE DEBUG ===');
    console.log('operacao:', operacao);
    console.log('userReq:', userReq);
    console.log('userBD.OM:', userBD.OM);
    console.log('objeto:', objeto);

    if (operacao === "cadastramento") {
        if (userReq.OM) {//se tiver OM na requisição
            console.log('userReq.OM existe:', userReq.OM);
            if (userReq.OM === userBD.OM) {
                eLocal = true;
                console.log('OM matches - eLocal = true');
            } else {
                eLocal = false;
                console.log('OM differs - eLocal = false');
            }
        } else {
            eLocal = true;
            console.log('userReq.OM não existe - eLocal = true');
        }
    }
    else if (["edicao", "remocao"].includes(operacao)) {
        ePropria = objeto.criado_por.toString() === userBD.SARAM.toString();
        eLocal = objeto.om_autora === userBD.OM;
        chavePermissao += ePropria ? "_propria" : "";
    } else {//alterarpermissao
        chavePermissao = objeto.acao;
        eLocal = objeto.pessoa.OM === userBD.OM;
    }

    chavePermissao += eLocal ? "_local" : "_geral";

    console.log('chavePermissao final:', chavePermissao);
    console.log('=== FIM DEBUG ===');

    return chavePermissao;
}

// Middleware para verificar permissões
const checarPermissao = (operacao) => {

    return asyncHandler(async (req, res, next) => {

        const userReq = req.user;

        let filtro = req.query.filtro;
        if (typeof filtro === "string") {
            try {
                filtro = JSON.parse(filtro);
            } catch (error) {
                filtro = {};
            }
        } else if (typeof filtro !== "object" || filtro === null) {
            filtro = {};
        }

        const obj = req.body;
        const id = ['PATCH', 'POST', 'PUT'].includes(req.method) ? obj._id : filtro._id;
        const colecao = obj?.colecao || req.query.colecao;
        const Modelo = objModelos[colecao]?.modelo;

        try {
            const userBD = await User.findById(userReq._id);

            if (!userBD) {
                logger.error(`Usuário não encontrado para o ID ${userReq._id}`);
                res.status(403);
                throw new Error("Usuário não encontrado!");
            }

            // MANUAL LOOKUP DA ROLE
            const roleDoc = await Role.findById(userBD.role);

            if (!roleDoc) {
                logger.error(`Role ${userBD.role} não encontrada`);
                res.status(403);
                throw new Error("Permissões não configuradas!");
            }

            const permissoes = roleDoc.permissions || [];

            console.log('User:', userBD.SARAM, userBD.nome);
            console.log('Role:', userBD.role);
            console.log('Permissions:', permissoes);

            req.user = userBD;

            if (operacao === "leitura") {
                if (permissoes.includes("leitura_geral")) return next();

                if (permissoes.includes("leitura_local")) {
                    req.query.filtro = JSON.stringify({ ...filtro, om_autora: userBD.OM });
                    return next();
                }

                if (permissoes.includes("leitura_propria_local")) {
                    req.query.filtro = JSON.stringify({ ...filtro, om_autora: userBD.OM, criado_por: userBD.SARAM });
                    return next();
                }

                res.status(403);
                throw new Error("Acesso negado para essa operação.");
            }

            if (operacao === "verusuarios") {
                if (userBD.role === "admin_geral" || userBD.role === "admin_local") return next();
                else {
                    res.status(403);
                    throw new Error("Acesso negado para essa operação.");
                }
            }

            const objeto = await Modelo?.findById(id) || obj;
            const chavePermissao = gerarChave(userReq, userBD, objeto, operacao);

            if (!permissoes.includes(chavePermissao)) {
                logger.error(`Acesso negado! Permissão necessária: ${chavePermissao} - ${userBD.SARAM}/${userBD.nome}`);
                logger.error(`Permissões disponíveis: ${permissoes.join(', ')}`);
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