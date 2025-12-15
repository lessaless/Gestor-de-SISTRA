const tratarErrosModel = require('../utils/tratamentoErrosMDB/tratamentoErrosMDB');
const logger = require("../utils/logs/logger.js");
/* const emObrasImg = "/emObras.png"; */
const asciiEmObras = '../utils/ascii/emObras.txt';
const asciiDIRINFRA = '../utils/ascii/DIRINFRA.txt';

const fs = require('fs');
const path = require('path');

const errorHandler = (err, req, res, next) => {

    let statusCode = res.statusCode || 500;
    let errorMessage = err.message || 'Erro interno do servidor!';

    if (err.name.includes('Mongo')) {
        errorMessage = tratarErrosModel(err, res);
        statusCode = res.statusCode;
    }

    const newStatusCode = statusCode !== 200 ? statusCode : 404;

    if (newStatusCode === "ECONNREFUSED" || errorMessage.includes("ECONNREFUSED")) {
        errorMessage = "Erro de conexão com o banco de dados.";
        logger.error("Para solucionar o erro a seguir, tente iniciar o mondoDB com 'sudo systemctl start mongod' [linux] ou 'net start mongodb' [windows], ou verifique se a porta 27017 está aberta.");
    }

    logger.error(`Código: ${newStatusCode} - Mensagem: ${errorMessage}`);


    // Adiciona uma mensagem personalizada para erros específicos, se necessário
    if (err.code === "USER_NOT_FOUND" || err.code === "NOT_UPDATED") {
        errorMessage = errorMessage;
    }
    else if (err.code === "ENOENT") {
        errorMessage = "Por favor, aguarde alguns segundos e tente novamente. Se o problema persistir, contate o administrador.";

    } else if (err.code === "EACCES") {
        errorMessage = "Permissão negada para acessar o arquivo. Contate o administrador e informe o código de erro!";

    } else if (err.code === "EPERM") {
        errorMessage = "Operação não permitida. Contate o administrador e informe o código de erro!";

    } else {
        return res.status(statusCode !== 200 ? statusCode : 400).json({ message: errorMessage });

    }

    let emObrasTexto = '';

    if (['NOT_UPDATED', 'USER_NOT_FOUND', 'ENOENT', 'EACCES', 'EPERM'].includes(err.code)) {
        try {
            const textoAscii = ['ENOENT', 'EACCES', 'EPERM'].includes(err.code) && asciiEmObras || asciiDIRINFRA;
            const filePath = path.join(__dirname, textoAscii);
            emObrasTexto = fs.readFileSync(filePath, 'utf-8');
        } catch (readErr) {
            emObrasTexto = 'Página em Manutenção.';
        }
        res.status(newStatusCode);
        // Retornar a resposta em HTML
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>[Código ${newStatusCode}]</title>
                <style>
                    body {
                        font-family: Verdana, Arial, sans-serif;
                        text-align: center;
                        background-color: #181818;
                        padding: 50px;
                        color: #0f0;
                    }
                    a {
                        color: #888;
                    }

                    h1 {
                        color: #0f0;
                    }
                    h3 {
                        color: #888;
                    }
                    p {
                        color: #0f0;
                        font-size: 20px;
                    }
                    img {
                        margin-top: 40px;
                    }
                    pre {
                        font-size: 0.3rem;
                        font-weight: bolder;
                        color: #0f0;
                    }
                </style>
            </head>
            <body>
                <h1>${err.code === 'ENOENT' ? 'PÁGINA EM MANUTENÇÃO' : ''}</h1>
                <p>${errorMessage}</p>
                <p><b>Seção de Análise de Dados da DIRINFRA</b></p>
                ${['NOT_UPDATED', 'USER_NOT_FOUND', 'ENOENT', 'EACCES', 'EPERM'].includes(err.code) && `<pre>${emObrasTexto}</pre>` || ``}
                <h3>[Código ${newStatusCode}]</h3>
            </body>
            </html>
        `);
    }
};

module.exports = errorHandler;