const express = require("express");
const router = express.Router();

const { obterSerinfras, obterDiaDaSemanas, obterAgenteCausadorAcidentes, obterParteDoCorpoAtingidas, obterSituacaoGeradoras,
    obterHouveDispensas, obterNaturezaDaAtividades, obterStatusFinals, 
    obterTipoDeAcidentes, 
    obterOMs, obterODS, obterEstados, obterMunicipios, obterEfetivo, 
    obterTerrenos, obterBenfeitorias, obterBenfeitoriasBim, 
    obterLocalidades, obterFasesDoProjeto, obterCodigosBim,
    obterStatus, obterDisciplinas, obterAps, obterCfs, obterCms,
    obterPlaninfras, obterEts, obterEvs, obterLas, obterLss,
    obterMas, obterMcs, obterMds, obterMdcs, obterMfs, obterMis,
    obterMrs, obterNss, obterNts, obterOds, obterPbs, obterPgs,
    obterPos, obterPps, obterPts, obterRes, obterRts, obterTas,
    obterTes, obterTjs, obterTms, obterTrs} = require("../controladores/utilController");
//const protect = require("../middleWare/authMiddleware");
//const protectCompetencias = require("../middleWare/authCompetenciasMiddleware");


// ============= //
// == SISTRA == //
// ============ //
router.get("/obterserinfras", obterSerinfras);
router.get("/obterdiadasemanas", obterDiaDaSemanas);
router.get("/obteragentecausadoracidentes", obterAgenteCausadorAcidentes);
router.get("/obtersituacaogeradoras", obterSituacaoGeradoras);
router.get("/obterpartedocorpoatingidas", obterParteDoCorpoAtingidas);
router.get("/obterhouvedispensas", obterHouveDispensas);
router.get("/obternaturezadaatividades", obterNaturezaDaAtividades);
router.get("/obtertipodeacidentes", obterTipoDeAcidentes)
router.get("/obterstatusfinals", obterStatusFinals)

// ============= //
//  fim SISTRA  //
// ============ //

router.get("/obteroms", obterOMs);
router.get("/obterods", obterODS);
router.get("/obterestados", obterEstados);
router.get("/obtermunicipios", obterMunicipios);
router.get("/obterefetivo", obterEfetivo);
router.get("/obterterrenos", obterTerrenos);  
router.get("/obterbenfeitorias", obterBenfeitorias); 
router.get("/obterbenfeitoriasbim", obterBenfeitoriasBim); 
router.get("/obterlocalidades", obterLocalidades); 
router.get("/obterfasesdoprojeto", obterFasesDoProjeto);
router.get("/obterstatus", obterStatus);
router.get("/obtercodigosbim", obterCodigosBim); 
router.get("/obterplaninfras", obterPlaninfras); 
router.get("/obterdisciplinas", obterDisciplinas); 

// ======== //
// == PEI == //
// ======== // 
router.get("/obteraps", obterAps); 
router.get("/obtercfs", obterCfs); 
router.get("/obtercms", obterCms); 
router.get("/obterets", obterEts); 
router.get("/obterevs", obterEvs); 
router.get("/obterlas", obterLas); 
router.get("/obterlss", obterLss); 
router.get("/obtermas", obterMas); 
router.get("/obtermcs", obterMcs); 
router.get("/obtermds", obterMds); 
router.get("/obtermdcs", obterMdcs); 
router.get("/obtermfs", obterMfs); 
router.get("/obtermis", obterMis); 
router.get("/obtermrs", obterMrs); 
router.get("/obternss", obterNss); 
router.get("/obternts", obterNts); 
router.get("/obterods", obterOds); 
router.get("/obterpbs", obterPbs); 
router.get("/obterpgs", obterPgs); 
router.get("/obterpos", obterPos); 
router.get("/obterpps", obterPps); 
router.get("/obterpts", obterPts); 
router.get("/obterres", obterRes); 
router.get("/obterrts", obterRts); 
router.get("/obtertas", obterTas); 
router.get("/obtertos", obterTes); 
router.get("/obtertjs", obterTjs); 
router.get("/obtertms", obterTms); 
router.get("/obtertrs", obterTrs); 

// ============= //
//  fim PEI  //
// ============ //


module.exports = router;