const tratarErrosModel = require('../utils/tratamentoErrosMDB/tratamentoErrosMDB.js');
const logger = require("../utils/logs/logger.js");
const emObrasImg = "/emObras.png";

const errorHandler = (err, req, res, next) => {

    let statusCode = res.statusCode || 500;
    let errorMessage = err.message || 'Erro interno do servidor!';
    
    if(err.name.includes('Mongo')) {
        errorMessage = tratarErrosModel(err, res);
        statusCode = res.statusCode;
    }

    const newStatusCode = statusCode !== 200 ? statusCode : 404;

    logger.error(`Código: ${newStatusCode} - Mensagem: ${errorMessage}`);
    

    // Adiciona uma mensagem personalizada para erros específicos, se necessário
    if (err.code === "USER_NOT_FOUND" || err.code === "NOT_UPDATED") {
        errorMessage = errorMessage;
    }
    else if (err.code === "ENOENT") {
        errorMessage = "Página em manutenção. Por favor, aguarde alguns segundos e tente novamente. Se o problema persistir, contate o administrador.";
    
    } else if (err.code === "EACCES") {
        errorMessage = "Permissão negada para acessar o arquivo. Contate o administrador e informe o código de erro!";
    
    } else if (err.code === "EPERM") {
        errorMessage = "Operação não permitida. Contate o administrador e informe o código de erro!";
    
    } else {
        return res.status(statusCode !== 200 ? statusCode : 400).json({message: errorMessage});

    }

    
    if(['NOT_UPDATED', 'USER_NOT_FOUND', 'ENOENT', 'EACCES', 'EPERM'].includes(err.code)){
        res.status(newStatusCode);
        // Retornar a resposta em HTML
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Erro ${newStatusCode}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        background-color: #f1f1f1;
                        padding: 50px;
                    }
                    h1 {
                        color: #FF0000;
                    }
                    p {
                        color: #444;
                        font-size: 20px;
                    }
                    img {
                        margin-top: 40px;
                    }
                </style>
            </head>
            <body>
                <h1>Erro ${newStatusCode}</h1>
                <p>${errorMessage}</p>
                <p><b>Seção de Análise de Dados da DIRINFRA</b></p>
                ${['ENOENT', 'EACCES', 'EPERM'].includes(err.code) && `<img src="${emObrasImg}" alt="Imagem em obras"/>` || ''}
            </body>
            </html>
        `);
    }
};

module.exports = errorHandler;