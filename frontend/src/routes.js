import { Navigate } from 'react-router-dom';

// routes.js
import HomePage from './pages/home-page/home-page';
import BasicPage from './pages/basic-page/basic-page';
import ContactPage from './pages/contact-page/contact-page';
import PriorizarPropostas from './pages/priorizar-propostas-page/priorizar-propostas-page';
import PainelPage from './pages/painel-page/painel-page';
import PermissaoPage from './pages/permissoes-page/permissoes-page';

//Sub-Rotas Doc. Técnico
import GCListar from './components/GerenciadorCrud/GCListarGerais';
import GCEditarCriar from './components/GerenciadorCrud/GCEditarCriarGerais';
// import GCDemandas from './components/GerenciadorCrud/GCDemandas';


//Sub-Rotas Planinfra
import GCListarPlaninfra from './components/GerenciadorCrud/GCListarPlaninfra';
import GCEditarCriarPlaninfra from './components/GerenciadorCrud/GCEditarCriarPlaninfra';

//Sub-Rotas Painel
import Logs from './components/Logs/Logs';
import PreCadastroLista from './components/PreCadastro/PreCadastroADM';
import Reports from './components/Reports/Reports';

/* Link para consulta de ícones: https://mui.com/material-ui/material-icons/ */

// pages
import ConfirmacaoDemandaPage from './pages/confirmation-page/confirmation-demanda-page';
import ConfirmacaoCNPage from './pages/confirmation-page/confirmation-cn-page';
import ConfirmacaoETPEPage from './pages/confirmation-page/confirmation-etpe-page';
import ConfirmacaoPropostaPage from './pages/confirmation-page/confirmation-proposta-page';

// icons
import Home from '@mui/icons-material/Home';
import EngineeringIcon from '@mui/icons-material/Engineering';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import WysiwygIcon from '@mui/icons-material/Wysiwyg';
import GCDemandas from './components/GerenciadorCrud/GCDemandas';
import BugReportIcon from '@mui/icons-material/BugReport';

const routes = [
  {
    nome: 'Início',
    path: 'index',
    component: <HomePage />,
    icon: <Home />,
  },
  {
    nome: 'PLANINFRA',
    path: 'planinfra',
    component: <BasicPage pagina="Fluxo PLANINFRA" />,
    icon: <TableChartIcon />,
    subRoutes: [//////////////////// NÃO MUDAR A ORDEM DO CONTEÚDO DA LISTA SEM VERIFICAR OS LAYOUTS (acesso pelo índice)
      {
        nome: 'Buscar',
        path: 'listar',
        component: <GCListarPlaninfra />,
        //icon: '|'
        icon: <FiberManualRecordIcon style={{ fontSize: '10px' }} />
      },
      {
        nome: 'Cadastrar',
        path: 'cadastrar',
        component: <GCEditarCriarPlaninfra />,
        //icon: '|'
        icon: <FiberManualRecordIcon style={{ fontSize: '10px' }} />
      },
      // {
      //   nome: 'Editar',
      //   path: 'editar',
      //   component: <GCEditarCriarPlaninfra />,
      //   //icon: '|'
      //   icon: <FiberManualRecordIcon style={{ fontSize: '10px' }} />
      // },
      {
        nome: 'Editar',
        path: 'editardemanda',
        component: <GCDemandas />,
        //icon: '|'
        icon: <FiberManualRecordIcon style={{ fontSize: '10px' }} />
      },
      // {
      //   nome: 'Priorizar Propostas',
      //   path: 'priorizarpropostas',
      //   component: <PriorizarPropostas />,
      //   //icon: '|'
      //   icon: <FiberManualRecordIcon style={{ fontSize: '10px' }} />
      // }
    ]
  },

  {
    nome: 'Documento Técnico',
    path: 'docs',
    /* component: <GeraisPage/>, */
    component: <BasicPage pagina="Doc. Técnico" />,
    icon: <DescriptionIcon />,
    subRoutes: [//////////////////// NÃO MUDAR A ORDEM DO CONTEÚDO DA LISTA SEM VERIFICAR OS LAYOUTS (acesso pelo índice)
      {
        nome: 'Buscar documento',
        path: 'listar',
        component: <GCListar />,
        //icon: '|'
        icon: <FiberManualRecordIcon style={{ fontSize: '10px' }} />
      },
      {
        nome: 'Numerar documento',
        path: 'cadastrar',
        component: <GCEditarCriar />,
        //icon: '|'
        icon: <FiberManualRecordIcon style={{ fontSize: '10px' }} />
      },
      {
        nome: 'Editar',
        path: 'editar',
        component: <GCEditarCriar />,
        //icon: '|'
        icon: <FiberManualRecordIcon style={{ fontSize: '10px' }} />
      },
    ]
  },

  {
    nome: 'Ajuda',
    path: 'help',
    component: <ContactPage />,
    icon: <HelpCenterIcon />,

    // SE IMPLEMENTAR UM FAQ, CONTINUAR DO CÓDIGO ABAIXO
    // subRoutes: [
    //   {
    //     nome: 'Fale Conosco',
    //     path: 'faleconosco',
    //     component: <ContactPage />,
    //     icon: <ChatIcon />
    //   },
    //   {
    //     nome: 'FAQ',
    //     path: 'faq',
    //     component: <FAQ />,//<= CRIAR
    //     icon: <QuestionAnswerIcon />
    //   }
    // ]
  },
  {
    nome: 'Gerenciar Permissões',
    path: 'gerenciar-permissoes',
    component: <PermissaoPage />,
    //icon: '|'
    icon: <ManageAccountsIcon />
    
    // nome: 'Gerenciar Permissões',
    // path: 'permissoes',
    // // component: <AtribuirPermissoesPage />,
    // icon: <ManageAccountsIcon />,
    // subRoutes: [
    // {
    //   nome: 'Atribuir Permissões',
    //   path: 'atribuir-permissoes',
    //   component: <AtribuirPermissoesPage />,
    //   //icon: '|'
    //   icon: <FiberManualRecordIcon style={{ fontSize: '10px' }} />
    // },
    // {
    //   nome: 'Remover Permissões',
    //   path: 'remover-permissoes',
    //   component: <RemoverPermissoesPage />,
    //   //icon: '|'
    //   icon: <FiberManualRecordIcon style={{ fontSize: '10px' }} />
    // },
    // ]
  },
  {
    nome: 'Painel',
    path: 'painel',//se mudar, deve verificar AbasFluxo.jsx
    component: <PainelPage />,
    icon: <EngineeringIcon />,
    subRoutes: [//////////////////// NÃO MUDAR A ORDEM DO CONTEÚDO DA LISTA SEM VERIFICAR OS LAYOUTS (acesso pelo índice)
      {
        nome: 'Logs',
        path: 'logs',
        component: <Logs />,
        icon: <WysiwygIcon />
      },
      {
        nome: 'Pré-cadastros',
        path: 'precadastros',
        component: <PreCadastroLista />,
        icon: <PersonAddAlt1Icon />
      },
      {
        nome: 'Chamados',
        path: 'reports',
        component: <Reports/>,
        // icon: <PersonAddAlt1Icon />
        icon: <BugReportIcon />
      }
    ]
  },
  {
    nome: 'ConfirmacaoDemanda',
    path: 'confirmacaodemanda',
    component: <ConfirmacaoDemandaPage />,
  },
  {
    nome: 'ConfirmacaoCN',
    path: 'confirmacaocn',
    component: <ConfirmacaoCNPage />,
  },
  {
    nome: 'ConfirmacaoETPE',
    path: 'confirmacaoetpe',
    component: <ConfirmacaoETPEPage />,
  },
  {
    nome: 'ConfirmacaoProposta',
    path: 'confirmacaoproposta',
    component: <ConfirmacaoPropostaPage />,
  },
  /*  {
     nome: 'Demandas',
     path: 'demandas',
     component: <DemandaPage/>,
     icon: <EngineeringIcon/>
   }, */

  {
    path: '*',
    component: <Navigate replace to="index" />,
  },
];

export default routes;
