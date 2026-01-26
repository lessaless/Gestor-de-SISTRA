const Arquivo = require("../../modelos/arquivoModel");
const CN = require("../../modelos/cnModel");
const Demanda = require("../../modelos/demandaModel");
const ETPE = require("../../modelos/etpeModel");
const User = require("../../modelos/userModel");
const Proposta = require("../../modelos/propostaModel");
const Gerais = require("../../modelos/geraisModel");
const PLANINFRA = require("../../modelos/planinfraModel")

//PEI
const CodigoProjeto = require("../../modelos/codigoProjetoModel");
const TAP = require("../../modelos/tapModel");
const GerenciamentoProj = require("../../modelos/gerenciamentoProjModel");
const TMP = require("../../modelos/tmpModel");
const TEP = require("../../modelos/tepModel");
// Novos formulários, em ordem alfabética
const AP = require("../../modelos/apModel");
const CF = require("../../modelos/cfModel");
const CM = require("../../modelos/cmModel");
const ET = require("../../modelos/etModel");
const EV = require("../../modelos/evModel");
const LA = require("../../modelos/laModel");
const LS = require("../../modelos/lsModel");
const MA = require("../../modelos/maModel");
const MC = require("../../modelos/mcModel");
const MD = require("../../modelos/mdModel");
const MDC = require("../../modelos/mdcModel");
const MF = require("../../modelos/mfModel");
const MI = require("../../modelos/miModel");
const MR = require("../../modelos/mrModel");
const NS = require("../../modelos/nsModel");
const NT = require("../../modelos/ntModel");
const OD = require("../../modelos/odModel");
const PB = require("../../modelos/pbModel");
const PG = require("../../modelos/pgModel");
const PO = require("../../modelos/poModel");
const PP = require("../../modelos/ppModel");
const PT = require("../../modelos/ptModel");
const RE = require("../../modelos/reModel");
const RT = require("../../modelos/rtModel");
const TA = require("../../modelos/taModel");
const TE = require("../../modelos/teModel");
const TJ = require("../../modelos/tjModel");
const TM = require("../../modelos/tmModel");
const TR = require("../../modelos/trModel");
/* subGerais */
const CadernoDeNecessidades = require("../../modelos/subGerais/cadernoDeNecessidadesModel");
const EstudoTPEngenharia = require("../../modelos/subGerais/estudoTPEngenhariaModel");
const LaudoTecnico = require("../../modelos/subGerais/laudoTecnicoModel");
const NotaTecnica = require("../../modelos/subGerais/notaTecnicaModel");
const OrdemTecnica = require("../../modelos/subGerais/ordemTecnicaModel");
const ParecerTecnico = require("../../modelos/subGerais/parecerTecnicoModel");
const RelatorioTecnico = require("../../modelos/subGerais/relatorioTecnicoModel");
// const PlanoInfra = require("../../modelos/subGerais/planoInfraModel")


/* subSistra */
const Acidente = require("../../modelos/subSistra/acidenteModel");

const SistraGerais = require("../../modelos/sistraModel");

const todas = [

    //subSistra

    'acidentes', 'sistragerais',

    'demandas', 'grupos', 'links', 'cns', 'etpes', 'propostas', 'planinfra',
    'codigoprojetos', 'taps', 'gerenciamentoproj', 'tmps', 'teps',

    'ap', 'cf', 'cm', 'et', 'ev', 'la', 'ls', 'ma', 'mc', 'md',
    'mdc', 'mf', 'mi', 'mr', 'ns', 'nt', 'od', 'pb', 'pg', 'po',
    'pp', 'pt', 're', 'rt', 'ta', 'te', 'tj', 'tm', 'tr',


    // subGerais
    'cadernodenecessidades',
    'estudotpengenharia',
    'laudotecnico',
    'notatecnica',
    'ordemtecnica',
    'parecertecnico',
    'relatoriotecnico'
];

module.exports = {
    //automaticos = chaves que são preenchidas automaticamente pelo backend
    //não vão para o front do usuário, mas o admin tem acesso para sobrescrever
    "objModelos":
    {
        /////////////////////////////////// subModelos
        "cadernodenecessidades": {
            "modelo": CadernoDeNecessidades,
            "automaticos": ['_id', '__v']
        },
        "estudotpengenharia": {
            "modelo": EstudoTPEngenharia,
            "automaticos": ['_id', '__v']
        },
        "laudotecnico": {
            "modelo": LaudoTecnico,
            "automaticos": ['_id', '__v']
        },
        "notatecnica": {
            "modelo": NotaTecnica,
            "automaticos": ['_id', '__v']
        },
        "ordemtecnica": {
            "modelo": OrdemTecnica,
            "automaticos": ['_id', '__v']
        },
        "parecertecnico": {
            "modelo": ParecerTecnico,
            "automaticos": ['_id', '__v']
        },
        "relatoriotecnico": {
            "modelo": RelatorioTecnico,
            "automaticos": ['_id', '__v']
        },


        //////////////////////////////////// modelos
        /* "arquivos": {
            "modelo": Arquivo,
            "automaticos": ['_id', '__v', 'caminho', 'createdAt', 'updatedAt', 'visualizacoes', 'criado_por', 'modificado_por', 'downloads']
        }, */
        // ============================= //
        // Início Modelos SISTRA
        // ============================= //
        "acidentes": {
            "modelo": Acidente,
            "automaticos": ['_id', '__v']
        },

        "sistragerais": {
            "modelo": SistraGerais,
            "automaticos": ['_id', '__v', 'criado_por', 'modificado_por', 'createdAt', 'updatedAt']
        },
        // ============================= //
        // FIM Modelos SISTRA
        // ============================= //
        "cns": {
            "modelo": CN,
            "automaticos": ['_id', '__v', 'id_demanda', 'createdAt', 'updatedAt']
        },
        "propostas": {
            "modelo": Proposta,
            "automaticos": ['_id', '__v', 'id_demanda', 'createdAt', 'updatedAt']
        },
        "demandas": {
            "modelo": Demanda,
            "automaticos": ['_id', '__v', 'createdAt', 'updatedAt']
        },
        "etpes": {
            "modelo": ETPE,
            "automaticos": ['_id', '__v', 'id_demanda', 'createdAt', 'updatedAt']
        },
        "gerais": {
            "modelo": Gerais,
            "automaticos": ['_id', '__v', 'criado_por', 'modificado_por', 'createdAt', 'updatedAt']
        },
        "planinfra": {
            "modelo": PLANINFRA,
            "automaticos": ['_id', '__v', 'criado_por', 'modificado_por', 'createdAt', 'updatedAt']
        },

        // ============================= //
        // Modelos PEI
        // ============================= //
        "codigoprojetos": {
            "modelo": CodigoProjeto,
            "automaticos": ['_id', '__v', 'criado_por', 'createdAt', 'updatedAt']
        },
        "taps": {
            "modelo": TAP,
            "automaticos": ['_id', '__v', 'id_tap', 'id_demanda',
                'createdAt', 'updatedAt']
        },
        "gerenciamentoproj": {
            "modelo": GerenciamentoProj,
            "automaticos": ['_id', '__v', , 'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "tmps": {
            "modelo": TMP,
            "automaticos": ['_id', '__v', , 'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "teps": {
            "modelo": TEP,
            "automaticos": ['_id', '__v', , 'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        // ============================= //
        // = Modelos PEI V2 - 27/11/025 = //
        // ============================= //
        "ap": {
            "modelo": AP,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "cf": {
            "modelo": CF,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "cm": {
            "modelo": CM,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "et": {
            "modelo": ET,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "ev": {
            "modelo": EV,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        // "la": {
        //     "modelo": LA,
        //     "automaticos": ['_id', '__v', 'codigo_projeto_bim',
        //         'codigo_documento_bim',
        //         'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        // },
        "ls": {
            "modelo": LS,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "ma": {
            "modelo": MA,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "mc": {
            "modelo": MC,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "md": {
            "modelo": MD,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "mdc": {
            "modelo": MDC,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "mf": {
            "modelo": MF,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "mi": {
            "modelo": MI,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "mr": {
            "modelo": MR,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "ns": {
            "modelo": NS,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "nt": {
            "modelo": NT,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "od": {
            "modelo": OD,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "pb": {
            "modelo": PB,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "pg": {
            "modelo": PG,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "po": {
            "modelo": PO,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "pp": {
            "modelo": PP,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "pt": {
            "modelo": PT,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "re": {
            "modelo": RE,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "rt": {
            "modelo": RT,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "ta": {
            "modelo": TA,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "te": {
            "modelo": TE,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "tj": {
            "modelo": TJ,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "tm": {
            "modelo": TM,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },
        "tr": {
            "modelo": TR,
            "automaticos": ['_id', '__v', 'codigo_projeto_bim',
                'codigo_documento_bim',
                'id_demanda', 'criado_por', 'createdAt', 'updatedAt']
        },

        // ============================= //
        // FIM Modelos PEI
        // ============================= //


        /* "users": {
            "modelo": User,
            "automaticos": ['_id', '__v', 'createdAt', 'updatedAt']
        } */
    },

    "colecoesLiberadas": {
        // Aplica-se aos usuários comuns (isAdmin = false)
        // especificar uma lista onde for diferente
        "GET": [...todas, 'gerais'],
        "POST": todas,
        "PATCH": todas,
        "UPDATE": todas,
        "DELETE": todas
    }
};