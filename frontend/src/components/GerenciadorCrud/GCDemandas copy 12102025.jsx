// GCDemandas.jsx  (with search box under Fechar header)
import React, { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { makeStyles } from '@material-ui/core/styles';

import DirinfraCard from '../DirinfraCard/DirinfraCard';
import Loading from '../Loader/Loading';

// NEW: import the searchable list select
import DirinfraListSelect from '../DirinfraSelect/DirinfraListSelect';
import DirinfraListSelectGC from '../DirinfraSelect/DirinfraListSelectGC';

import { listarDados } from '../../utils/gerCrud';
import { formulariosPlaninfra } from '../../utils/ColecaoModelo';
import { SalvarProvider } from '../../utils/SalvarContext';
import demandaService from '../../services/demandaService';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const descontoVH = '145px';

/* Styles */
const useStyles = makeStyles({
  opcaoDocumento: {
    padding: '10px 15px',
    cursor: 'pointer',
    paddingLeft: '10px',
    fontSize: '.9rem',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-font4light)',
    border: '1px solid var(--color-borderdefault)',
    borderRadius: 6,
    boxSizing: 'border-box',
    width: '92%',
    marginBottom: 6,
    marginLeft: '10px',
    boxShadow: '0 1px 0 rgba(0,0,0,0.15)',
    transition: 'background-color .12s ease, color .12s ease, transform .08s ease',
    '&:hover': {
      backgroundColor: 'var(--color-bg3)',
      color: 'var(--color-font)',
      transform: 'translateY(-1px)'
    },
    whiteSpace: 'normal',
    wordBreak: 'break-word'
  },

  // search box style
  searchBoxWrap: {
    width: '15px',
    flexDirection: 'column', // ✅ Changed to column
    display: 'flex',
    marginLeft: '10px',
    borderRadius: 8,
    marginBottom: 24,   // ✅ Reduced from 34 to 8
    marginTop: 24,      // ✅ Reduced from 17 to 6

    boxSizing: 'border-box',
    backgroundColor: 'var(--color-bg1)',
    color: 'var(--color-font4light)',
  },

  searchInput: {
    width: '9.1%',
    position: 'fixed',
    padding: '10px 15px',
    borderRadius: 8,
    marginBottom: 1,
    marginTop: 1,
    // display: 'inline-flex',
    border: '1px solid var(--color-borderdefault)',
    backgroundColor: 'var(--color-bg1)',
    color: 'var(--color-font4light)',
    boxSizing: 'border-box',
    boxShadow: '0 1px 0 rgba(0,0,0,0.15)',
    outline: 'none',
    fontSize: '.9rem',
    '&::placeholder': {
      color: 'var(--color-placeholder)'
    },
    '&:focus': {
      borderColor: 'var(--color-borderfocus)',
      background: 'var(--color-bg1)'
    }
  },

  // small clear button inside search
  searchClearBtn: {
    width: '100%', // ✅ Changed from 108px
    padding: '6px 8px',
    borderRadius: 6,
    border: '1px solid var(--color-borderdefault)',
    backgroundColor: 'var(--color-bg1)',
    color: 'var(--color-font4light)',
    cursor: 'pointer',
    fontSize: '.85rem', // ✅ Added font size
    fontWeight: 700,
    transition: 'background-color .12s ease, color .12s ease', // ✅ Added transition
    '&:hover': {
      backgroundColor: 'var(--color-bg3)',
      color: 'var(--color-font)'
    }
  }
});

const useStylesFechar = makeStyles({
  // header row that contains both the "Fechar" box (left) and the "X" button (right)
  fecharHeaderRow: {
    width: '92%',
    boxSizing: 'border-box',
    padding: '1px 1px',
    marginLeft: '10px',
    marginTop: '6px',
    position: 'sticky',
    top: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-bg1)',
    border: '1px solid var(--color-borderdefault)',
    borderRadius: 6,
    zIndex: 1100,
  },

  // the left boxed "Fechar" label so it looks like your current small rounded box
  fecharBox: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '55px',
    marginRight: '10px',
    padding: '4px 1px',
    borderRadius: 6,
    backgroundColor: 'var(--color-bg1)',
    color: 'var(--color-font4light)',
    fontWeight: 800,
    boxSizing: 'border-box',
  },

  // the X button that sits flush to the right
  fecharBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    minWidth: 34,
    padding: '0 1px',
    borderRadius: 6,
    border: '1px solid var(--color-borderdefault)',
    backgroundColor: 'var(--color-bg1)',
    color: 'var(--color-font4light)',
    cursor: 'pointer',
    boxSizing: 'border-box',
    fontWeight: 700,
    transition: 'background-color .12s ease, color .12s ease, transform .06s ease',
    '&:hover': {
      backgroundColor: 'var(--color-bg3)',
      color: 'var(--color-font)',
      transform: 'translateY(-1px)'
    }
  }
});

const estilo = {
  container: {
    display: 'flex',
    height: `calc(100vh - ${descontoVH})`,
    width: '100%',
  },
  painelEsquerdoTitulo: {
    padding: '10px',
    borderBottom: '1px solid var(--color-borderdefault)',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  painelEsquerdo: {
    overflowY: 'auto',
    height: `calc(100vh - ${descontoVH} - 40px)`,
    padding: '10px',
  },
  painelDireito: {
    border: 'solid 1px var(--color-borderdefault)',
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
  },
  painelDireitoBox: {
    boxShadow: 'var(--color-shadow) 0px 0px 10px 1px inset, var(--color-shadow) -18px 0px 10px 1px inset',
  },
  lista: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    userSelect: 'none',
  },
  itemFluxo: {
    margin: '6px 0',
    padding: '12px 14px',
    cursor: 'pointer',
    backgroundColor: 'var(--color-bg3)',
    border: '1px solid var(--color-borderdefault)',
    color: 'var(--color-font4light)',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },

  itemFluxoVazio: {
    cursor: 'not-allowed',
    backgroundColor: 'var(--color-disabled)'
  },
  itemColecao: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '3px 0',
    padding: '8px 12px',
    cursor: 'pointer',
    backgroundColor: 'var(--color-bg3)',
    border: '1px solid transparent',
    color: 'var(--color-font4light)',
    fontWeight: 400,
    fontSize: '0.9rem',
    transition: 'background 0.3s',
  },
  itemSelecionado: {
    backgroundColor: 'var(--color-realce4light)',
    border: '1px solid var(--color-borderfocus)',
  },
  listaDocs: {
    listStyleType: 'none',
    userSelect: 'none',
  },
  itemDocs: {
    margin: '4px 10px',
    padding: '8px 0px',
    cursor: 'pointer',
    textDecoration: 'underline',
    color: 'var(--color-link)',
    width: 'fit-content'
  },
  submenu: (expandido) => ({
    listStyleType: 'none',
    marginLeft: 10,
    paddingLeft: 6,
    backgroundColor: 'var(--color-bg1)',
    borderLeft: '1px solid var(--color-borderdefault)',
    maxHeight: expandido ? '800px' : '0',
    opacity: expandido ? 1 : 0,
    overflow: 'hidden',
    transition: 'all 0.4s ease',
  }),
  iconeExpandir: (expandido) => ({
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.3s ease',
    transform: expandido ? 'rotate(180deg)' : 'rotate(0deg)',
  }),
  resizer: {
    width: '14px',
    cursor: 'col-resize',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  dragIndicator: {
    color: 'var(--color-disabled)',
    fontSize: '15px',
    margin: '-4px 2px 0'
  }
};
const FLUXOS = ["PPI", "PEI", "Obra"]; // ordem fixa

const GCDemandas = () => {
  // useForm() used for the DirinfraListSelect inputs (we will pass setValue/watch)
  const methods = useForm();
  const { reset } = methods;

  const { id_demanda, _colecao } = useParams();//pega o id_demanda da url
  const [colecao, setColecao] = useState(_colecao);

  const classes = useStyles();
  const classesFechar = useStylesFechar();

  const [pecas, setPecas] = useState([]);//lista de peças do fluxo (PPI, PEI, Obra) com refId que monta o menu
  const [pecaSelecionada, setPecaSelecionada] = useState(null);//objeto do formulário selecionado

  /* loaders */
  const [isLoadingDemanda, setIsLoadingDemanda] = useState(false);
  const [isLoadingPeca, setIsLoadingPeca] = useState(false);

  /* states auxiliares para redimensionamento do menu lateral */
  const [larguraEsquerda, setLarguraEsquerda] = useState(265);
  const isResizing = useRef(false);
  const containerRef = useRef(null);
  // Verifica se o form foi preenchido ou não
  const [temRefId, setTemRefId] = useState(false);

  const [listaDocumentos, setListaDocumentos] = useState([]);// lista de documentos disponíveis para vincular (quando a peça selecionada não tem refId)
  const [vinculo, setVinculo] = useState(null);//gerenciar estado de vínculo com demanda
  const [vinculoStatus, setVinculoStatus] = useState(<div></div>);//componente que exibe o status do vínculo
  const desvincularRef = useRef();
  const [mostrarMenuPEI, setMostrarMenuPEI] = useState(false);
  const [expandido, setExpandido] = useState({ [FLUXOS[0]]: true });// controla quais menus estão expandidos (começa com PPI aberto)

  // search state for the PEI menu
  const [searchTerm, setSearchTerm] = useState('');
  const searchClasses = useStyles();

  const toggleFluxo = (fluxo) => {//recolher/expandir menus
    setExpandido((prev) => ({ ...prev, [fluxo]: !prev[fluxo] }));
  };
  const iniciarResize = () => {//iniciar redimensionamento do menu lateral
    isResizing.current = true;
    document.addEventListener("mousemove", aoArrastar);
    document.addEventListener("mouseup", pararResize);
  };
  const aoArrastar = (e) => {//redimensionar menu lateral
    if (!isResizing.current || !containerRef.current) return;
    const offsetLeft = containerRef.current.getBoundingClientRect().left;
    const novaLargura = e.clientX - offsetLeft;
    if (novaLargura > 150 && novaLargura < 600) {
      setLarguraEsquerda(novaLargura);
    }
  };
  const pararResize = () => {//parar redimensionamento do menu lateral
    isResizing.current = false;
    document.removeEventListener("mousemove", aoArrastar);
    document.removeEventListener("mouseup", pararResize);
  };

  // Função para carregar a demanda e suas peças do fluxo ao carregar a página
  useEffect(() => {
    const aoCarregarPagina = async () => {

      setIsLoadingDemanda(true);
      try {
        const resp = await demandaService.lerPecasDemanda({ id_demanda: id_demanda });

        let listaFluxo;

        if (!resp.data || resp.data.pecas_fluxo.length === 0) {
          listaFluxo = [];
        } else {
          listaFluxo = resp.data.pecas_fluxo;
        }
        unirListas(listaFluxo);

      } catch (erro) {
        console.error(erro);
        toast.error(erro.message || erro);
        setIsLoadingDemanda(false);
      }
    };
    aoCarregarPagina();
  }, [id_demanda, reset]);
  // Função para unir a lista fixa de coleções do fluxo com a lista que veio do banco, chamada após o carregamento da página
  const unirListas = (listaBD) => {
    const colecoes = Object.keys(formulariosPlaninfra);

    // transforma listaBD em um dicionário pra lookup rápido
    const bdMap = Object.fromEntries(listaBD.map(item => [item.colecao, item]));

    const resultado = colecoes.map(c => {
      if (bdMap[c]) {
        return bdMap[c]; // usa o que veio do banco
      }
      return { colecao: c, refId: null }; // fallback
    });
    setPecas(resultado);
    setIsLoadingDemanda(false);
  };

  useEffect(() => {
    if (colecao) {
      carregarListaDocumentos(colecao);
    } else {
      setListaDocumentos([]);
    }
  }, [colecao]);
  // Carrega a lista de documentos disponíveis para vincular (que não estão vinculados a nenhuma demanda)
  const carregarListaDocumentos = async (colecao) => {
    try {
      const docs = await listarDados({
        colecao,
        filtro: {
          $or: [
            { id_demanda: { $exists: false } },
            { id_demanda: null }
          ]
        }
      });
      setListaDocumentos(docs);

    } catch (erro) {
      console.error(erro);
      toast.error(erro.message || "Erro ao listar documentos");
    }
  };

  // Função chamada ao clicar em uma peça do fluxo no menu lateral
  const aoClicarPeca = async (p) => {
    setTemRefId(!!p.refId);
    setColecao(p.colecao);

    if (!p.refId) {//limpar formulário e exibe vazio
      setPecaSelecionada(null);
      setVinculo(null);
      reset({});
      return;
    }

    try {
      setIsLoadingPeca(true);
      const peca = await listarDados({ colecao: p.colecao, filtro: { _id: p.refId } });
      if (!peca || peca.length === 0) {
        console.log("estou cravado de !peca")
        console.log("valor de peca é", peca)
        return;
      }
      setPecaSelecionada(peca[0]);

      setVinculo(peca[0]._id);
      reset(peca[0]);
      setIsLoadingPeca(false);

    } catch (erro) {
      console.error(erro);
      toast.error(erro.message || erro);
      return;
    }
  };
  // sempre que mudar a peça selecionada, atualiza o formulário
  useEffect(() => {
    if (pecaSelecionada?._id) {
      window.dataParaFormulario(pecaSelecionada);//função global para formatar datas
      reset(pecaSelecionada);
    } else reset({});
  }, [pecaSelecionada]);

  // Função chamada quando o formulário é salvo (recebe o ID do documento salvo ou null se desvinculou)
  const atualizarRefId = (colecao, objBD) => {
    setPecaSelecionada(objBD);
    const id = objBD?._id || null;

    setPecas(prev => {
      const idx = prev.findIndex(p => p.colecao === colecao);
      if (idx === -1) return prev;
      const copia = [...prev];
      copia[idx] = { ...copia[idx], refId: id };
      return copia;
    });
    // Atualiza refId 
    setTemRefId(!!id);
    if (id === null) {
      setPecaSelecionada(null);
      carregarListaDocumentos(colecao);
      setVinculo(null);
      reset({});
    } else {
      setVinculo(id);
    }
  };

  // Gerencia o estado do vínculo com a demanda e exibe mensagens ou link conforme o caso
  useEffect(() => {
    const { _id, id_demanda } = pecaSelecionada || {};
    if (!_id || colecao === 'demandas') return setVinculoStatus(<div></div>);

    if (id_demanda) {
      if (vinculo) {
        setVinculoStatus(
          <span>
            <a
              style={{ color: 'var(--color-link)' }}
              href='#'
              onClick={(e) => {
                e.preventDefault();
                desvincularRef.current?.()
                setVinculo(null);
              }}
            >
              Desvincular da demanda
            </a>
          </span>
        );
      } else {
        setVinculoStatus(<span style={{ color: 'red' }}>Vínculo alterado. Salve para atualizar.</span>);
      }

    } else {
      setVinculoStatus(<span style={{ color: 'orange' }}>É necessário salvar para vincular à demanda.</span>);
    }
  }, [pecaSelecionada, vinculo]);

  if (isLoadingDemanda) return <Loading mensagem={'Buscando demanda...'} personalizarEstilo={{ height: '100vh', width: '100%' }} />

  return (
    <>
      <div ref={containerRef} style={estilo.container}>
        {/* painel esquerdo */}
        <div
          style={{
            width: larguraEsquerda,
            minWidth: 150,
            maxWidth: 600,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={estilo.painelEsquerdoTitulo}>
            <h2>{id_demanda}</h2>
          </div>
          <div style={estilo.painelEsquerdo}>
            <ul style={estilo.lista}>
              {FLUXOS.map((fluxo) => {
                // pega apenas peças que pertencem a esse fluxo
                const colecoesDoFluxo = pecas.filter(
                  (p) => formulariosPlaninfra[p.colecao]?.fluxo === fluxo
                );
                if (colecoesDoFluxo.length === 0) return (
                  <li key={fluxo} >
                    <div
                      style={{ ...estilo.itemFluxo, ...estilo.itemFluxoVazio }}
                      title="Nenhuma peça disponível"
                    >
                      <span>{fluxo}</span>
                      <span>
                        <ExpandMoreIcon />
                      </span>
                    </div>
                  </li>
                );

                // Se for PEI, separa formulários preenchidos e não preenchidos
                if (fluxo === "PEI") {
                  const formulariosPreenchidos = colecoesDoFluxo.filter(p => p.refId);
                  const formulariosNaoPreenchidos = colecoesDoFluxo.filter(p => !p.refId);

                  return (
                    <li key={fluxo}>
                      <div
                        onClick={() => toggleFluxo(fluxo)}
                        style={estilo.itemFluxo}
                      >
                        <span>{fluxo}</span>
                        <span style={estilo.iconeExpandir(expandido[fluxo])}>
                          <ExpandMoreIcon />
                        </span>
                      </div>

                      <div style={estilo.submenu(expandido[fluxo])}>
                        {/* If there are non-filled forms, show searchable list select */}
                        {formulariosNaoPreenchidos.length > 0 && (
                          <div style={{ padding: '5px' }}>
                            <button
                              id="pei-selector-button"
                              onClick={(e) => {
                                setMostrarMenuPEI(!mostrarMenuPEI);
                                setSearchTerm(''); // reset search when opening
                              }}
                              style={{
                                width: '100%',
                                padding: '22px 22px', // ✅ Reduced padding
                                backgroundColor: 'var(--color-bg1)',
                                color: 'var(--color-font4light)',
                                border: '1px solid var(--color-borderdefault)',
                                borderRadius: '8px',
                                fontSize: '.85rem', // ✅ Slightly larger font
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'relative' // ✅ Added
                              }}
                            >
                              <span>Selecione Tipo de Documento</span>
                              <span style={{
                                display: 'flex', // ✅ Added
                                alignItems: 'center', // ✅ Added
                                fontSize: '1rem', // ✅ Added
                                marginLeft: '8px' // ✅ Added instead of absolute positioning
                              }}>
                                {mostrarMenuPEI ? '✕' : '▼'}
                              </span>
                            </button>
                          </div>
                        )}

                        {/* Menu renderizado FORA do submenu para evitar clipping */}
                        {mostrarMenuPEI && formulariosNaoPreenchidos.length > 0 && (
                          <>
                            {/* Overlay para fechar ao clicar fora */}
                            <div
                              onClick={() => setMostrarMenuPEI(false)}
                              style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 999
                              }}
                            />

                            {/* Menu fixo */}
                            <div style={{
                              position: 'fixed',
                              top: (() => {
                                const button = document.getElementById('pei-selector-button');
                                if (button) {
                                  const rect = button.getBoundingClientRect();
                                  return `${rect.bottom + 5}px`;
                                }
                                return '250px';
                              })(),
                              left: (() => {
                                const button = document.getElementById('pei-selector-button');
                                if (button) {
                                  const rect = button.getBoundingClientRect();
                                  return `${rect.left}px`;
                                }
                                return '30px';
                              })(),
                              width: '220px',
                              backgroundColor: 'var(--color-bg1)',
                              border: '2px solid',
                              borderRadius: '5px',
                              boxShadow: '0px 4px 20px 0px var(--color-shadow)',
                              maxHeight: '300px',
                              overflowY: 'auto',
                              zIndex: 1001
                            }}>

                              {/* SINGLE header container (Fechar + X) */}
                              {/* <div className={classesFechar.fecharHeaderRow}>
                                {/* left boxed "Fechar" - keeps position where it currently is */}
                              {/* <div className={classesFechar.fecharBox}>
                                Fechar
                              </div>

                              {/* right-side X button - flush to right */}
                              {/* <button
                                type="button"
                                className={classesFechar.fecharBtn}
                                onClick={() => setMostrarMenuPEI(false)}
                                aria-label="Fechar menu"
                                title="Fechar"
                              >
                                ✕
                              </button> */}
                              {/* </div> */}
                              {/* Combined header with Fechar, Search, and X button */}
                              <div style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '10px',
                                marginLeft: '1px',
                                marginTop: '6px',
                                marginBottom: '12px',
                                position: 'sticky',
                                top: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                backgroundColor: 'var(--color-bg1)',
                                // border: '1px solid var(--color-borderdefault)',
                                // borderRadius: 6,
                                zIndex: 1100,
                              }}>
                                {/* First row: Fechar label and X button */}
                                <div style={{
                                  display: 'flex',
                                  // border: '1px solid var(--color-borderdefault)',
                                  // borderRadius: 6,
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}>
                                  <div style={{
                                    fontSize: '1rem',
                                    marginLeft: '10px',
                                    fontWeight: 800,
                                    color: 'var(--color-font4light)',
                                  }}>
                                    Fechar
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setMostrarMenuPEI(false)}
                                    aria-label="Fechar menu"
                                    title="Fechar"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      height: 28,
                                      minWidth: 28,
                                      
                                      padding: '0',
                                      borderRadius: 6,
                                      border: '1px solid var(--color-borderdefault)',
                                      backgroundColor: 'var(--color-bg1)',
                                      color: 'var(--color-font4light)',
                                      cursor: 'pointer',
                                      fontWeight: 700,
                                      fontSize: '1.2rem',
                                      transition: 'background-color .12s ease, color .12s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'var(--color-bg3)';
                                      e.currentTarget.style.color = 'var(--color-font)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'var(--color-bg1)';
                                      e.currentTarget.style.color = 'var(--color-font4light)';
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>

                                {/* Second row: Search input */}
                                <input
                                  placeholder="Pesquise..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  style={{
                                    width: '185px',
                                    padding: '8px 3px',
                                    marginLeft: '0px',
                                    borderRadius: 6,
                                    border: '1px solid var(--color-borderdefault)',
                                    backgroundColor: 'var(--color-bg1)',
                                    color: 'var(--color-font4light)',
                                    boxSizing: 'border-box',
                                    outline: 'none',
                                    fontSize: '.9rem',
                                  }}
                                  onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-borderfocus)';
                                  }}
                                  onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-borderdefault)';
                                  }}
                                />
                              </div>

                              {/* SEARCH BOX: below Fechar and before the list
                            <div className={searchClasses.searchBoxWrap}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                  className={searchClasses.searchInput}
                                  placeholder="Pesquise..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm ? (
                                  <button
                                    className={searchClasses.searchClearBtn}
                                    onClick={() => setSearchTerm('')}
                                    type="button"
                                    aria-label="Limpar pesquisa"
                                    title="Limpar"
                                  >
                                    ×
                                  </button>
                                ) : null}
                              </div>
                            </div> */}

                              {/* Lista de opções (filtered by searchTerm) */}
                              {formulariosNaoPreenchidos
                                .filter((p) => {
                                  const nome = formulariosPlaninfra[p.colecao]?.nome ?? '';
                                  if (!searchTerm) return true;
                                  return nome.toLowerCase().includes(searchTerm.trim().toLowerCase());
                                })
                                .map((p) => (
                                  <div
                                    key={p.colecao}
                                    onClick={() => {
                                      aoClicarPeca(p);
                                      setMostrarMenuPEI(false);
                                    }}
                                    className={classes.opcaoDocumento}
                                  >
                                    {formulariosPlaninfra[p.colecao]?.nome}
                                  </div>
                                ))
                              }

                            </div>
                          </>
                        )}
                        {/* Mostra formulários preenchidos como lista depois do dropdown */}
                        {formulariosPreenchidos.length > 0 && (
                          <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
                            {formulariosPreenchidos.map((p) => (
                              <li
                                key={p.colecao}
                                style={{
                                  ...estilo.itemColecao,
                                  ...(colecao === p.colecao ? estilo.itemSelecionado : {}),
                                }}
                                onClick={() => aoClicarPeca(p)}
                              >
                                {formulariosPlaninfra[p.colecao]?.nome}
                                <span style={{ color: 'var(--botao-editar)' }}>
                                  ✔
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  );
                }

                // Para PPI e Obra, mantém o comportamento atual
                return (
                  <li key={fluxo}>
                    <div
                      onClick={() => toggleFluxo(fluxo)}
                      style={estilo.itemFluxo}
                    >
                      <span>{fluxo}</span>
                      <span style={estilo.iconeExpandir(expandido[fluxo])}>
                        <ExpandMoreIcon />
                      </span>
                    </div>
                    <ul style={estilo.submenu(expandido[fluxo])}>
                      {colecoesDoFluxo.map((p) => (
                        <li
                          key={p.colecao}
                          style={{
                            ...estilo.itemColecao,
                            ...(colecao === p.colecao ? estilo.itemSelecionado : {}),
                          }}
                          onClick={() => aoClicarPeca(p)}
                        >
                          {formulariosPlaninfra[p.colecao]?.nome}

                          {p.refId ? (
                            <span style={{ color: 'var(--botao-editar)' }}>
                              ✔
                            </span>
                          ) : (
                            <span style={{ color: 'var(--botao-novo)' }}>
                              ✚
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* resizer */}
        <div onMouseDown={iniciarResize} style={estilo.resizer}>
          <DragIndicatorIcon style={estilo.dragIndicator} />
          <DragIndicatorIcon style={estilo.dragIndicator} />
        </div>

        {/* painel direito */}
        <div
          style={
            colecao
              ? { ...estilo.painelDireito, ...estilo.painelDireitoBox }
              : estilo.painelDireito
          }
        >
          {isLoadingPeca ? (
            <Loading mensagem={'Carregando informações do formulário...'} personalizarEstilo={{ backgroundColor: 'unset' }} />
          ) : colecao ?
            pecaSelecionada ? (
              <FormProvider
                key={`${colecao}-${pecaSelecionada ? (pecaSelecionada._id || pecaSelecionada.refId) : 'novo'}`}
                {...methods}
              >
                <SalvarProvider
                  onSaved={(savedData) => {
                    const objBD = typeof savedData === 'string' ? { _id: savedData } : savedData;
                    atualizarRefId(colecao, objBD);
                  }}
                >
                  <div>
                    {vinculoStatus}
                    {React.cloneElement(
                      formulariosPlaninfra[colecao]?.componente || <p>Formulário não encontrado para a coleção "{colecao}".</p>,
                      { modoVisualizacao: temRefId }
                    )}
                  </div>
                </SalvarProvider>
              </FormProvider>

            ) : (
              <>
                <h3>Formulário de {formulariosPlaninfra[colecao]?.nome}</h3>
                <p>Escolha da lista ou <a href="#" style={{ color: 'var(--color-link)' }} onClick={(e) => { e.preventDefault(); setPecaSelecionada({}) }}>crie um novo</a>.</p>
                {listaDocumentos.length > 0 ? (
                  <>
                    <br /><p>Lista:</p>
                    <ul style={estilo.listaDocs}>
                      {listaDocumentos.map(doc => (
                        <li
                          key={doc._id}
                          style={{
                            ...estilo.itemDocs
                          }}
                          onClick={() => {
                            setPecaSelecionada(doc);
                          }}
                        >
                          {doc.id_gerais || doc.titulo_doc}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p style={{ marginTop: '10px' }}>Nenhum documento disponível para ser vinculado.</p>
                )}
              </>
            )
            : (
              <p>Selecione uma peça do fluxo.</p>
            )}
        </div>
      </div >
    </>
  );
};

export default GCDemandas;
