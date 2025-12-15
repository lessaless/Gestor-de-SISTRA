const asyncHandler = require("express-async-handler");
const Preenchimento = require("../modelos/preenchimentoModel");
const logger = require("../utils/logs/logger.js");

const DATA_REFERENCIA = new Date(process.env.DATA_ATUALIZADOS); // Data de referência para a verificação

const SARAMS_PASSE_LIVRE = [
  '1857398', // MB Batista
  '2215179', // BR Steven
  '2842432', // BR Rebouças
  '3038963', // CL Ronaldo
]; // SARAMs que não precisam de verificação

function linkCompetencias() {
  const url = new URL(process.env.URL);

  if (url.href.includes('portaldirinfra')) { // Produção
    return "https://www.competencias.portaldirinfra.intraer/";

  } else { // Homologação
    url.port = 5000; // Porta padrão do Cadastro de Competências
    return url.toString();
  }
}

function formatarData(data) {
  const dataObj = new Date(data);
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
  const ano = dataObj.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

const atualizadosMiddleware = asyncHandler(async (req, res, next) => {
  
  try {
    const saram = req.user?.SARAM; // req.user é salvo no middleware do Keycloak

    if (!saram) {
      const error = new Error(`Usuário não encontrado!`);
      error.code = "USER_NOT_FOUND";
      res.status(401);
      throw error;
    }

    if(SARAMS_PASSE_LIVRE.includes(saram)) {
      logger.warn(`SARAM ${saram} com acesso livre (ignorando última atualização). Usuário: ${req.user}`);
      next();
      return;
    }

    // Busca o preenchimento pelo SARAM do usuário
    const preenchimento = await Preenchimento.findOne({ SARAM: saram });

    if (!preenchimento) {
      const error = new Error(`Preenchimento não encontrado para este usuário (SARAM: ${saram}). É preciso preencher o <a href=${linkCompetencias()}>Cadastro de Competências</a>!<br/><br/>Depois, aguarde cerca de 5 minutos para tentar novamente.`);
      error.code = "USER_NOT_FOUND";
      res.status(404);
      throw error;
    }

    // Verifica se o campo lastUpdatedDate está atualizado
    const dataUltimaAtualizacao = new Date(preenchimento.lastUpdatedDate);


    if (dataUltimaAtualizacao < DATA_REFERENCIA) {
      let dataUA = formatarData(dataUltimaAtualizacao);
      let dataRef = formatarData(DATA_REFERENCIA);

      const error = new Error(`Para usar este sistema, é necessário atualizar o <a href=${linkCompetencias()}>Cadastro de Competências</a> (Portal DIRINFRA).<br/><br/>Depois, aguarde cerca de 5 minutos para tentar novamente. Última atualização para o SARAM ${saram}: ${dataUA} - Data de referência: ${dataRef}.<br/>`);
      error.code = "NOT_UPDATED";
      res.status(403);
      throw error;
    }

    next();

  } catch (error) {
    next(error); // Encaminha o erro para o middleware de tratamento de erros

  }
});

module.exports = atualizadosMiddleware;
