import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import routes from '../../routes.js';
import Loading from '../../components/Loader/Loading.jsx'
import userService from '../../services/userService.js';
import adminService from '../../services/adminService.js';
import permissaoService from '../../services/permissaoService.js';
import authReport from '../../services/authReport.js';

import { useDarkTheme } from '../../useDarkTheme.js';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const titulo = process.env.REACT_APP_TITULO;
const imagem = '/faviconDIRINFRA.png';

const Main = () => {

  const { ToggleButton } = useDarkTheme();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [admCrud, setAdmCrud] = useState(false);
  const [redirecionarLogin, setRedirecionarLogin] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const [notificacoes, setNotificacoes] = useState({});//ícone na barra lateral

  useEffect(() => {
    // Verifica se o location.pathname possui três partes
    const pathParts = location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 3) {
      const path = pathParts[1]; // Segundo elemento do location.pathname (subRota ativa)
      setExpandedMenus((prevMenus) => ({
        ...prevMenus,
        [path]: true
      }));
    }
  }, [location.pathname]);

  useEffect(() => {
    async function estaLogado() {
      try {
        console.log("Entrou em estaLogado")
        const resp = await userService.verificaLogin();
        console.log("valor de resp de estaLogado é", resp)

        if (resp.status === 200) {
          setIsLoading(false);

          try {
            const newResp = await adminService.verificarAdmin();
            if (newResp.data.eAdmin === true) setAdmin(true);

          } catch (erro) {
            setAdmin(false);
          }

        } else setRedirecionarLogin(true); //////////////

      } catch (erro) {
        console.error(erro);
        toast.error(erro.response.data.message || erro);
        setIsLoading(false);
        setRedirecionarLogin(true); //////////
      }
    }
    estaLogado();
  }, []);

  useEffect(() => {
    async function eAdminCrud() {
      try {
        const newResp = await permissaoService.Autorizar();
        if (newResp.status === 200) setAdmCrud(true);

      } catch (erro) {
        setAdmCrud(false);

      }
    }

    eAdminCrud();
  }, []);

  const toggleMenu = (path) => {
    setExpandedMenus((prevState) => ({
      ...prevState,
      [path]: !prevState[path],
    }));
  };

  useEffect(() => {
    if (admin) {
      carregarReports();
      carregarPreCadastros();
    }
  }, [admin]);

  const carregarReports = async () => {
    try {
      const resp = await authReport.lerReports();

      if (resp.data.length > 0) {
        const resolvidos = resp.data.filter(item => !item.resolvido);
        setNotificacoes(prev => ({
          ...prev,
          reports: resolvidos.length
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const carregarPreCadastros = async () => {
    try {
      const resp = await adminService.verPreCadastros();

      if (resp.data.length > 0) {
        const precadastros = resp.data;
        setNotificacoes(prev => ({
          ...prev,
          precadastros: precadastros.length
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };


  //if (redirecionarLogin) return window.location.href = `/`; //Aqui o código tenta acessar a página "/deslogando" e é redirecionado para a página de "not found" e então redirecionado para a página do keycloak por não estar logado
  if (isLoading) return <Loading personalizarEstilo={{ height: '100vh', width: '100%' }} />

  const lista_de_rotas_para_esconder = ["confirmacaodemanda", "confirmacaocn", "confirmacaoetpe", "confirmacaoproposta"];
  const lista_de_subrotas_para_esconder = ["editar", "priorizarpropostas", "editardemanda"];

  return (
    <div id="main">
      <div id="container">
        <div id="ghost-sidebar">

          {/* TOPO ESQUERDO */}
          <div id="topleft-sidebar">
            <div id="header">
              <img src={imagem} alt="logoDirinfra" />
              <span>{titulo}</span>
            </div>
          </div>

          {/* BARRA LATERAL */}
          <div id="sidebar">
            <div id="section">

              {/* CRIA O MENU COM OS ITENS, BASEADO NO routes.js */}
              {routes.map((route, index) => (

                (
                  // Só renderiza atalho do 'painel' se for admin
                  (route.path !== 'painel' || admin) &&
                  // Só renderiza atalho do 'gerenciar-permissoes' se role for adm
                  (route.path !== 'gerenciar-permissoes' || admCrud) &&
                  // Não renderiza atalhos da 'lista_de_rotas_para_esconder'
                  (!lista_de_rotas_para_esconder.includes(route.path)) &&
                  (route.path !== '*')
                )
                && (
                  <React.Fragment key={index}>

                    {/* SE NÃO TEM SUBROTAS */}
                    {!route.subRoutes ? (
                      <Link
                        to={route.path}
                        className='secoesTitulos'
                      >
                        <div className={`menuLi ${location.pathname.replace('/main/', '') === route.path ? 'secoesAtivas' : ''}`}>
                          <div className='item'>
                            {route.icon}
                            <span>{route.nome}</span>
                            {/* badge de notificação */}
                            {notificacoes[route.path] > 0 && (
                              <span className="notificacao">{notificacoes[route.path]}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ) : (

                      /* SE TEM SUBROTAS */

                      /* ITENS ROTAS */
                      <div className='secoesTitulos'>
                        <div
                          className={`menuLi ${location.pathname.replace('/main/', '') === route.path ? 'secoesAtivas' : ''}`}
                          onClick={() => toggleMenu(route.path)}
                        >
                          <div className='item'>
                            {route.icon}
                            <span>{route.nome}</span>
                            {/* badge de notificação do pai (soma das subrotas) */}
                            {!expandedMenus[route.path] && route.subRoutes && (() => {
                              const total = route.subRoutes.reduce(
                                (acc, subRoute) => acc + (notificacoes[subRoute.path] || 0),
                                0
                              );
                              return total > 0 ? <span className="notificacao">{total}</span> : null;
                            })()}
                          </div>
                          <div className='icone'>
                            <span
                              className='expandirIcone'
                              style={{
                                transform: expandedMenus[route.path] ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease',
                                padding: '0'
                              }}
                            >
                              <ExpandMoreIcon />
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ITENS SUBROTAS, QUANDO HOUVER */}
                    {route.subRoutes && (
                      <ul className={`subMenu ${expandedMenus[route.path] ? 'expanded' : ''}`}>
                        {route.subRoutes.map((subRoute, subIndex) => (
                          (!lista_de_subrotas_para_esconder.includes(subRoute.path) && (
                            <li key={subIndex}>
                              <Link
                                to={`${route.path}/${subRoute.path}`}
                                className={`subMenuLi ${location.pathname.replace('/main/', '') === `${route.path}/${subRoute.path}` ? 'secoesAtivas' : ''
                                  }`}
                              >
                                <div className='item'>
                                  {subRoute.icon}
                                  <span>{subRoute.nome}</span>
                                  {/* badge de notificação */}
                                  {notificacoes[subRoute.path] > 0 && (
                                    <span className="notificacao">{notificacoes[subRoute.path]}</span>
                                  )}
                                </div>
                              </Link>
                            </li>
                          ))
                        ))}
                      </ul>
                    )}
                  </React.Fragment>
                )
              ))}
            </div>


            <div id="bottom-sidebar">
              <div id="central">
                {ToggleButton}

                {/* <button onClick={() => window.location.href = `${process.env.REACT_APP_AUTH_PAGE}/logoff`}>Sair</button> */}

                <button onClick={() => window.location.href = `${process.env.REACT_APP_BACKEND}/logout`}>Sair</button>

              </div>
            </div>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div id="content">
          <div id="topbar"></div>
          <div id="componentes">

            {/* DEFINE AS ROTAS E RESPECTIVOS COMPONENTES DE ACORDO COM O routes.js */}
            <Routes>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.component}>

                  {/* DEFINE AS SUBROTAS, QUANDO HOUVER */}
                  {route.subRoutes && route.subRoutes.map((subRoute, subIndex) => (
                    <Route
                      key={subIndex}
                      path={['editar'].includes(subRoute.path) ? `${subRoute.path}/:_colecao/:id`
                        :
                        subRoute.path === 'editardemanda' ? `${subRoute.path}/:id_demanda`
                          :
                          subRoute.path
                      }
                      element={subRoute.component}
                    //Se for 'editar/editardemanda', deve ter coleção e id obrigatórios, por isso definido somente acima
                    //já se for 'cadastrar', pode ser sem coleção e id, que serão definidos acima (map)
                    //como também é definido abaixo o caso específico para receber coleção
                    />
                  ))}

                  {/* <Route path="listar/:_colecao" element={<GCListar />} /> */}
                  {/* <Route path="cadastrar/:_colecao" element={<GCEditarCriar />} /> */}
                  <Route path="listar/:_colecao" element={route?.subRoutes?.[0]?.path === 'listar' && route.subRoutes[0].component} />
                  <Route path="cadastrar/:_colecao" element={route?.subRoutes?.[1]?.path === 'cadastrar' && route.subRoutes[1].component} />

                  {route.subRoutes && route.subRoutes.length > 0 && (
                    <Route path="" element={<Navigate to='/' />} />
                  )}
                </Route>
              ))}

              <Route path="*" element={<Navigate to="/home/listar" />} />
            </Routes>


          </div>
          <div id="creditos">
            <em>DIRINFRA 2024-{new Date().getFullYear()} - Seção de Análise de Dados - Versão 1.1</em>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;