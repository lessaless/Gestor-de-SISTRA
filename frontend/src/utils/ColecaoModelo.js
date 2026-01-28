// modelos Planinfra
import DemandaForm from '../components/Formularios/Planinfra/DemandaForm';
import CNForm from '../components/Formularios/Planinfra/CNForm';
import ETPEForm from '../components/Formularios/Planinfra/ETPEForm';
import TAPForm from '../components/Formularios/Planinfra/TAPForm';
import PLANINFRAForm from '../components/Formularios/Planinfra/PLANINFRAForm';
import CodigoProjetoForm from '../components/Formularios/Planinfra/CodigoProjetoForm';
import GERENCIAMENTOPROJForm from '../components/Formularios/Planinfra/GerenciamentoProjForm';
import TMPForm from '../components/Formularios/Planinfra/TMPForm';
import TEPForm from '../components/Formularios/Planinfra/TEPForm';
import ArtForm from '../components/Formularios/Planinfra/ARTForm';

// modelos PEI
import APForm from '../components/Formularios/PEI/APForm';
import CFForm from '../components/Formularios/PEI/CForm';
import CMForm from '../components/Formularios/PEI/CMForm';
import ETForm from '../components/Formularios/PEI/ETForm';
import EVForm from '../components/Formularios/PEI/EVForm';
import LAForm from '../components/Formularios/PEI/LAForm';
import LSForm from '../components/Formularios/PEI/LSForm';
import MAForm from '../components/Formularios/PEI/MAForm';
import MCForm from '../components/Formularios/PEI/MCForm';
import MDForm from '../components/Formularios/PEI/MDForm';
import MDCForm from '../components/Formularios/PEI/MDCForm';
import MFForm from '../components/Formularios/PEI/MFForm';
import MIForm from '../components/Formularios/PEI/MIForm';
import MRForm from '../components/Formularios/PEI/MRForm';
import NSForm from '../components/Formularios/PEI/NSForm';
import NTForm from '../components/Formularios/PEI/NTForm';
import ODForm from '../components/Formularios/PEI/ODForm';
import PBForm from '../components/Formularios/PEI/PBForm';
import PGForm from '../components/Formularios/PEI/PGForm';
import POForm from '../components/Formularios/PEI/POForm';
import PPForm from '../components/Formularios/PEI/PPForm';
import PTForm from '../components/Formularios/PEI/PTForm';
import REForm from '../components/Formularios/PEI/REForm';
import RTForm from '../components/Formularios/PEI/RTForm';
import TAForm from '../components/Formularios/PEI/TAForm';
import TEForm from '../components/Formularios/PEI/TEForm';
import TJForm from '../components/Formularios/PEI/TJForm';
import TMForm from '../components/Formularios/PEI/TMForm';
import TRForm from '../components/Formularios/PEI/TRForm';
import PropostaForm from '../components/Formularios/Planinfra/PropostaForm';

// subModelos Gerais
import CadernoDeNecessidadesForm from '../components/Formularios/Gerais/CadernoDeNecessidadesForm';
import EstudoTPEngenhariaForm from '../components/Formularios/Gerais/EstudoTPEngenhariaForm';
import LaudoTecnicoForm from '../components/Formularios/Gerais/LaudoTecnicoForm';
import NotaTecnicaForm from '../components/Formularios/Gerais/NotaTecnicaForm';
import OrdemTecnicaForm from '../components/Formularios/Gerais/OrdemTecnicaForm';
import ParecerTecnicoForm from '../components/Formularios/Gerais/ParecerTecnicoForm';
import RelatorioTecnicoForm from '../components/Formularios/Gerais/RelatorioTecnicoForm';

//subModelos SISTRA
import AcidenteForm from '../components/Formularios/Sistra/AcidenteForm';

/*
  Utilizados nos componentes:
  - AbasFluxo.jsx
  - GCEditarCriar.jsx //planinfra e doc
  - GCListar.jsx //planinfra e doc
*/
export const formulariosSistra = {

  // ========================== //
  // subModelos SISTRA
  // ========================== //

  // "acidentes": {
  //   "nome": "Acidente",
  //   "componente": <AcidenteForm />,
  //   "modelo": "Acidentes"
  // },
   "acidentes": {
    "nome": "Acidentes",
    "componente": <AcidenteForm />,
    "modelo": "Acidentes"
  },
  // ========================== //
  // Fim subModelos SISTRA
  // ========================== //

};
export const formulariosGerais = {

  // ========================== //
  //subModelos SISTRA
  // ========================== //

  "acidentes": {
    "nome": "Acidentes",
    "componente": <AcidenteForm />,
    "modelo": "Acidentes"
  },
  // ========================== //
  // Fim subModelos SISTRA
  // ========================== //
  "cadernodenecessidades": {
    "nome": "Caderno de Necessidades",
    "componente": <CadernoDeNecessidadesForm />,
    "modelo": "CadernoDeNecessidades"
  },
  "estudotpengenharia": {
    "nome": "Estudo Técnico Preliminar de Engenharia",
    "componente": <EstudoTPEngenhariaForm />,
    "modelo": "EstudoTecnicoPreliminarDeEngenharia"
  },
  "laudotecnico": {
    "nome": "Laudo Técnico",
    "componente": <LaudoTecnicoForm />,
    "modelo": "LaudoTecnico"
  },
  "notatecnica": {
    "nome": "Nota Técnica",
    "componente": <NotaTecnicaForm />,
    "modelo": "NotaTecnica"
  },
  "ordemtecnica": {
    "nome": "Ordem Técnica",
    "componente": <OrdemTecnicaForm />,
    "modelo": "OrdemTecnica"
  },
  "parecertecnico": {
    "nome": "Parecer Técnico",
    "componente": <ParecerTecnicoForm />,
    "modelo": "ParecerTecnico"
  },
  "relatoriotecnico": {
    "nome": "Relatório Técnico",
    "componente": <RelatorioTecnicoForm />,
    "modelo": "RelatorioTecnico"
  }
};


export const formulariosPlaninfra = {
  /* ---------------- PPI -----------------*/
  "demandas": {
    "fluxo": "PPI",
    "nome": "Demanda",
    "componente": <DemandaForm />
  },

  "cadernodenecessidades": {
    "fluxo": "PPI",
    "nome": "CN",
    "componente": <CadernoDeNecessidadesForm />
  },

  "estudotpengenharia": {
    "fluxo": "PPI",
    "nome": "Estudo Técnico Preliminar de Engenharia",
    "componente": <EstudoTPEngenhariaForm />,
  },

  // "etpes": {
  //   "fluxo": "PPI",
  //   "nome": "ETPE",
  //   "componente": <ETPEForm/>
  // },

  "planinfra": {
    "fluxo": "PPI",
    "nome": "PLANINFRA",
    "componente": <PLANINFRAForm />
  },
  // "codigoprojetos": {
  //   "fluxo": "PEI",
  //   "nome": "Código Projeto",
  //   "componente": <CodigoProjetoForm />
  // },

  /* ---------------- PEI -----------------*/
  // "taps": {
  //   "fluxo": "PEI",
  //   "nome": "TAP",
  //   "componente": <TAPForm />
  // },
  "ap": {
    "fluxo": "PEI",
    "nome": "Apresentação de Projeto",
    "componente": <APForm />
  },
  "cf": {
    "fluxo": "PEI",
    "nome": "Cronograma Físico-Financeiro",
    "componente": <CFForm />
  },
  "cm": {
    "fluxo": "PEI",
    "nome": "Critério de Medição",
    "componente": <CMForm />
  },
  "et": {
    "fluxo": "PEI",
    "nome": "Especificação Técnica",
    "componente": <ETForm />
  },
  "ev": {
    "fluxo": "PEI",
    "nome": "Estudo de Viabilidade",
    "componente": <EVForm />
  },
  "laudotecnico": {
    "fluxo": "PEI",
    "nome": "Laudo Técnico",
    "componente": <LaudoTecnicoForm />
  },
  // "la": {
  //   "fluxo": "PEI",
  //   "nome": "Laudo",
  //   "componente": <LAForm />
  // },
  "ls": {
    "fluxo": "PEI",
    "nome": "Lista de Serviço",
    "componente": <LSForm />
  },
  "ma": {
    "fluxo": "PEI",
    "nome": "Manual",
    "componente": <MAForm />
  },
  "mc": {
    "fluxo": "PEI",
    "nome": "Memorial de Cálculo",
    "componente": <MCForm />
  },
  "md": {
    "fluxo": "PEI",
    "nome": "Memorial Descritivo",
    "componente": <MDForm />
  },
  "mdc": {
    "fluxo": "PEI",
    "nome": "Memorial Descritivo e Cálculo",
    "componente": <MDCForm />
  },
  "mf": {
    "fluxo": "PEI",
    "nome": "Modelo Federado",
    "componente": <MFForm />
  },
  "mi": {
    "fluxo": "PEI",
    "nome": "Modelo IFC",
    "componente": <MIForm />
  },
  "mr": {
    "fluxo": "PEI",
    "nome": "Modelo Revit",
    "componente": <MRForm />
  },
  "ns": {
    "fluxo": "PEI",
    "nome": "Nota de Serviço",
    "componente": <NSForm />
  },

  "notatecnica": {
    "fluxo": "PEI",
    "nome": "Nota Técnica",
    "componente": <NotaTecnicaForm />,
  },

  "od": {
    "fluxo": "PEI",
    "nome": "Outros Documentos",
    "componente": <ODForm />
  },

  "ordemtecnica": {
    "fluxo": "PEI",
    "nome": "Ordem Técnica",
    "componente": <OrdemTecnicaForm />
  },

  "parecertecnico": {
    "fluxo": "PEI",
    "nome": "Parecer Técnico",
    "componente": <ParecerTecnicoForm />
  },

  "pb": {
    "fluxo": "PEI",
    "nome": "Plano de Execução BIM",
    "componente": <PBForm />
  },

  "pg": {
    "fluxo": "PEI",
    "nome": "Plano Geral",
    "componente": <PGForm />
  },

  "po": {
    "fluxo": "PEI",
    "nome": "Planilha Orçamentária",
    "componente": <POForm />
  },

  "pp": {
    "fluxo": "PEI",
    "nome": "Pesquisa de Preço",
    "componente": <PPForm />
  },

  "re": {
    "fluxo": "PEI",
    "nome": "Recomendações Para Elaboração do Edital",
    "componente": <REForm />
  },

  "relatoriotecnico": {
    "fluxo": "PEI",
    "nome": "Relatorio Técnico",
    "componente": <RelatorioTecnicoForm />
  },

  "ta": {
    "fluxo": "PEI",
    "nome": "Termo de Abertura de Projeto",
    "componente": <TAForm />
  },

  "te": {
    "fluxo": "PEI",
    "nome": "Termo de Encerramento de Projeto",
    "componente": <TEForm />
  },

  "tj": {
    "fluxo": "PEI",
    "nome": "Termo de Justificativas Técnicas Relevantes",
    "componente": <TJForm />
  },

  "tm": {
    "fluxo": "PEI",
    "nome": "Termo de Modificação do Projeto",
    "componente": <TMForm />
  },

  "tr": {
    "fluxo": "PEI",
    "nome": "Termo de Condições para Autorização de Modificações de Projeto",
    "componente": <TRForm />
  },

  // "gerenciamentoproj": {
  //   "fluxo": "PEI",
  //   "nome": "Gerenciamento do Projeto",
  //   "componente": <GERENCIAMENTOPROJForm />
  // },

  // "tmps": {
  //   "fluxo": "PEI",
  //   "nome": "TMP",
  //   "componente": <TMPForm />
  // },

  // "teps": {
  //   "fluxo": "PEI",
  //   "nome": "TEP",
  //   "componente": <TEPForm />
  // },

  // "arts": {
  //   "fluxo": "PEI",
  //   "nome": "ART",
  //   "componente": <ArtForm />
  // },

  /* ---------------- Obras -----------------*/
  // "gerais": {
  //   "fluxo": "Obra",
  //   "nome": "foofoo",
  //   "componente": <GeralForm/>
  // },
};