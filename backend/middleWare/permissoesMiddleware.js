const asyncHandler = require("express-async-handler");
const User = require("../modelos/userModel");
const Role = require("../modelos/roleModel");
const { objModelos } = require('../utils/modelosMongo/modelosMongo');
const logger = require("../utils/logs/logger");

const gerarChave = (userReq, userBD, objeto, operacao) => {

    let ePropria = false;
    let eLocal = false;
    let chavePermissao = operacao;

    if (operacao === "cadastramento") {
        if (userReq.OM) {
            if (userReq.OM === userBD.OM) eLocal = true;
            else eLocal = false;
        } else eLocal = true;

    }
    else if (["edicao", "remocao"].includes(operacao)) {
        ePropria = objeto.criado_por.toString() === userBD.SARAM.toString();
        eLocal = objeto.om_autora === userBD.OM;
        chavePermissao += ePropria ? "_propria" : "";

    } else {
        chavePermissao = objeto.acao;
        eLocal = objeto.pessoa.OM === userBD.OM;
    }

    chavePermissao += eLocal ? "_local" : "_geral";
    console.log("Valor de chavePermissao é", chavePermissao)

    return chavePermissao;
}

// Middleware para verificar permissões
const checarPermissao = (operacao) => {

    return asyncHandler(async (req, res, next) => {

        const userReq = req.user;

        // Handle filtro from both query (GET) and body (POST)
        let filtro = req.query.filtro || req.body.filtro;
        
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
            const userBD = await User.findById(userReq._id).populate('role');
            console.log("Valor de userBD é", userBD);
            req.user = userBD;

            if (!userBD) {
                logger.error(`Usuário (${userBD}) não encontrado para o ID ${userReq._id}`);
                res.status(403);
                throw new Error("Usuário não encontrado!");
            }

            const permissoes = userBD.role?.permissions || [];

            // ========================================
            // SPECIAL HANDLING FOR LEITURA (READ) OPERATION
            // ========================================
            if (operacao === "leitura") {

                // Priority 1: leitura_geral - see everything (no filter)
                if (permissoes.includes("leitura_geral")) {
                    return next();
                }

                // Priority 2: leitura_local - see only documents from their OM
                if (permissoes.includes("leitura_local")) {
                    const filtroComOM = { ...filtro, om_autora: userBD.OM };
                    req.query.filtro = JSON.stringify(filtroComOM);
                    req.body.filtro = filtroComOM;
                    return next();
                }

                // Priority 3: leitura_propria_local - see only their own documents in their OM
                if (permissoes.includes("leitura_propria_local")) {
                    const filtroComOMeProprio = { 
                        ...filtro, 
                        om_autora: userBD.OM, 
                        criado_por: userBD.SARAM 
                    };
                    req.query.filtro = JSON.stringify(filtroComOMeProprio);
                    req.body.filtro = filtroComOMeProprio;
                    return next();
                }

                // No read permission
                res.status(403);
                throw new Error("Acesso negado para essa operação.");
            }

            // ========================================
            // SPECIAL HANDLING FOR VERUSUARIOS
            // ========================================
            if (operacao === "verusuarios") {
                if (userBD.role?._id === "admin_geral" || userBD.role?._id === "admin_local") {
                    return next();
                } else {
                    res.status(403);
                    throw new Error("Acesso negado para essa operação.");
                }
            }

            // ========================================
            // FOR EDICAO, REMOCAO, CADASTRAMENTO
            // ========================================
            const objeto = await Modelo?.findById(id) || obj;
            const chavePermissao = gerarChave(userReq, userBD, objeto, operacao);

            // Check permission hierarchy for edit/delete operations
            let temPermissao = false;
            let precisaChecarOM = false;

            if (["edicao", "remocao"].includes(operacao)) {
                // Check permission hierarchy: _geral > _local > _propria_local
                
                // Highest level: _geral (can do anything, any OM)
                if (permissoes.includes(`${operacao}_geral`)) {
                    temPermissao = true;
                    precisaChecarOM = false; // No OM restriction
                }
                // Middle level: _local (can do in their OM only)
                else if (permissoes.includes(`${operacao}_local`)) {
                    temPermissao = true;
                    precisaChecarOM = true; // Must be in their OM
                }
                // Lowest level: _propria_local (can only do their own docs in their OM)
                else if (permissoes.includes(`${operacao}_propria_local`)) {
                    // Must be their own document
                    if (objeto.criado_por.toString() === userBD.SARAM.toString()) {
                        temPermissao = true;
                        precisaChecarOM = true; // Must be in their OM
                    }
                }
                // Fallback: check exact generated permission
                else if (permissoes.includes(chavePermissao)) {
                    temPermissao = true;
                    precisaChecarOM = chavePermissao.includes("_local");
                }
                
            } else {
                // For cadastramento and other operations, use original logic
                temPermissao = permissoes.includes(chavePermissao);
                precisaChecarOM = chavePermissao.includes("_local");
            }

            // Check if user has required permission
            if (!temPermissao) {
                logger.error(`Acesso negado! Permissão necessária: ${chavePermissao} - ${userBD.SARAM}/${userBD.nome}`);
                res.status(403);
                throw new Error("Acesso negado para essa operação.");
            }

            // Verify OM match if needed
            if (precisaChecarOM && objeto.om_autora !== userBD.OM) {
                logger.error(`Acesso negado! Documento de OM diferente: ${objeto.om_autora} (doc) vs ${userBD.OM} (user)`);
                res.status(403);
                throw new Error("Você só pode acessar documentos da sua OM.");
            }

            logger.info(`Operação permitida: ${chavePermissao} - ${userBD.SARAM}/${userBD.nome}`);
            next();

        } catch (err) {
            next(err);
        }

    });

};

module.exports = checarPermissao;