const asyncHandler = require("express-async-handler");
const Usuario = require("../modelos/preenchimentoModelPoliticaPriv.js")
const logger = require("../utils/logs/logger.js");

const DATA_POLITICA_VIGENTE = new Date(process.env.DATA_POLITICA_VIGENTE); // Data de referência para a verificação

const SARAMS_PASSE_LIVRE = [
  '1857398', // MB Batista
  '2215179', // BR Steven
  '2842432', // BR Rebouças
  '3038963', // CL Ronaldo
]; // SARAMs que não precisam de verificação

function linkPoliticaPrivacidade() {
  const url = new URL(process.env.URL);

  if (url.href.includes('portaldirinfra')) { // Produção
    return "https://www.competencias.portaldirinfra.intraer/politica-privacidade";
  } else { // Homologação
    url.port = 5000;
    url.pathname = '/politica-privacidade';
    return url.toString();
  }
}

function formatarData(data) {
  const dataObj = new Date(data);
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = dataObj.getFullYear();
  return `${dia}/${mes}/${ano}`;
}


const politicaPrivacidadeMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const saram = req.user?.SARAM;

    if (!saram) {
      res.status(401);
      throw new Error("Usuário não encontrado!");
    }

    if (SARAMS_PASSE_LIVRE.includes(saram)) {
      logger.warn(`SARAM ${saram} com acesso livre (ignorando aceitação da política). Usuário: ${req.user}`);
      return next();
    }

    const usuario = await Usuario.findOne({ SARAM: saram });

    if (!usuario) {
      const error = new Error(`Registro de aceitação da Política de Privacidade não encontrado para o SARAM: ${saram}.<br/><br/>É necessário aceitar a <a href="${linkPoliticaPrivacidade()}">Política de Privacidade</a> para usar este sistema.`);
      error.code = "PRIVACY_POLICY_RECORD_NOT_FOUND";
      res.status(404);
      throw error;
    }

    if (!usuario.PoliticaDePrivacidade) {
      const error = new Error(`É necessário aceitar a <a href="${linkPoliticaPrivacidade()}">Política de Privacidade</a> para usar este sistema. SARAM: ${saram}`);
      error.code = "PRIVACY_POLICY_NOT_ACCEPTED";
      res.status(403);
      throw error;
    }

    if (usuario.dataAceitacaoPolitica && DATA_POLITICA_VIGENTE) {
      const dataAceitacao = new Date(usuario.dataAceitacaoPolitica);

      if (dataAceitacao < DATA_POLITICA_VIGENTE) {
        const dataAceita = formatarData(dataAceitacao);
        const dataPolitica = formatarData(DATA_POLITICA_VIGENTE);

        const error = new Error(`A <a href="${linkPoliticaPrivacidade()}">Política de Privacidade</a> foi atualizada e precisa ser aceita novamente.<br/><br/>Última aceitação para o SARAM ${saram}: ${dataAceita} - Nova política vigente desde: ${dataPolitica}.`);
        error.code = "PRIVACY_POLICY_OUTDATED";
        res.status(403);
        throw error;
      }
    }

    logger.info(`SARAM ${saram} - Política de privacidade aceita e válida.`);
    next();

  } catch (error) {
    next(error);
  }
});
module.exports = politicaPrivacidadeMiddleware ;
