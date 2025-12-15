/*
    Componente para gerenciar CRUD de demandas e suas peças do fluxo (PPI, PEI, Obra)
*/

import React, { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import DirinfraCard from '../DirinfraCard/DirinfraCard';
import Loading from '../Loader/Loading';

import { listarDados } from '../../utils/gerCrud';
import { formulariosPlaninfra } from '../../utils/ColecaoModelo';
import { SalvarProvider } from '../../utils/SalvarContext';
import demandaService from '../../services/demandaService';

import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const descontoVH = '145px';
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
        // borderRadius: '6px',
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
        // color: 'var(--color-realce)'
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
    const methods = useForm();
    const { reset } = methods;

    const { id_demanda, _colecao } = useParams();//pega o id_demanda da url
    const [colecao, setColecao] = useState(_colecao);

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

    const [expandido, setExpandido] = useState({ [FLUXOS[0]]: true });// controla quais menus estão expandidos (começa com PPI aberto)

    const toggleFluxo = (fluxo) => {//recolher/expandir menus
        setExpandido((prev) => ({ ...prev, [fluxo]: !prev[fluxo] }));
        // console.log(expandido)
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
                // setTimeout(() => window.history.back(), 2000);//volta para a página anterior
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
                // Aqui retorna Formulários sem serem repetidos.
                // Ou seja, não é possível importar dois Forms iguais.
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
    // Carrega o formulário correspondente e popula com os dados se houver refId
    // Se não houver refId, limpa o formulário para criação de novo
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
            console.log(`o valor de p.colecao é ${p.colecao}`)
            console.log("Valor de p.refId é", p.refId)
            // console.log(`o valor de peca.length é ${peca.length}`)
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
    // Atualiza o refId na lista de peças do fluxo
    // Se salvou (recebeu ID), mantém o formulário selecionado
    // Se desvinculou (recebeu null), limpa o formulário e recarrega a lista de documentos disponíveis
    const atualizarRefId = (colecao, objBD) => {
        console.log('=== atualizarRefId DEBUG ===');
        console.log('colecao:', colecao);
        console.log('objBD:', objBD);
        console.log('objBD type:', typeof objBD);
        console.log('objBD._id:', objBD?._id);
        console.log('===========================');
        setPecaSelecionada(objBD);
        const id = objBD?._id || null;

        setPecas(prev => {
            const idx = prev.findIndex(p => p.colecao === colecao);
            console.log('Found index:', idx, 'for colecao:', colecao);
            if (idx === -1) return prev;
            const copia = [...prev];
            copia[idx] = { ...copia[idx], refId: id };
            console.log(' Valor de copia[idx], fim de atualizarRefIDpecas:', copia[idx])
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
        if (!_id || colecao === 'demandas') return setVinculoStatus(<div></div>);//se não tem _id é obj novo, se 'demandas' também não deve exibir

        if (id_demanda) {//já está vinculado à demanda
            if (vinculo) {//se tem vínculo, veio do banco ou já salvou, exibe link para desvincular
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
            } else {//se não tem vínculo, foi desvinculado, exibe aviso para salvar
                setVinculoStatus(<span style={{ color: 'red' }}>Vínculo alterado. Salve para atualizar.</span>);
            }

        } else {//não está vinculado à demanda
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
                                                {/* Mostra dropdown primeiro para formulários não preenchidos */}
                                                {formulariosNaoPreenchidos.length > 0 && (
                                                    <div style={{ padding: '10px' }}>
                                                        <select
                                                            key={`pei-select-${formulariosNaoPreenchidos.length}`}
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px',
                                                                backgroundColor: 'var(--color-bg3)',
                                                                color: 'var(--color-font4light)',
                                                                border: '1px solid var(--color-borderdefault)',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.9rem'
                                                            }}
                                                            value=""
                                                            onChange={(e) => {
                                                                const colecaoSelecionada = e.target.value;
                                                                if (colecaoSelecionada) {
                                                                    const peca = formulariosNaoPreenchidos.find(p => p.colecao === colecaoSelecionada);
                                                                    if (peca) {
                                                                        aoClicarPeca(peca);
                                                                        e.target.value = ""; // Reset dropdown
                                                                    }
                                                                }
                                                            }
                                                            }
                                                        >
                                                            <option value="">Selecione Tipo de Documento</option>
                                                            {formulariosNaoPreenchidos.map((p) => (
                                                                <option key={p.colecao} value={p.colecao}>
                                                                    {formulariosPlaninfra[p.colecao]?.nome}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
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
                                /* key garante que mesmo que tenha formulários iguais na página, sejam tratados como únicos */
                                key={`${colecao}-${pecaSelecionada ? (pecaSelecionada._id || pecaSelecionada.refId) : 'novo'}`}
                                {...methods}
                            >
                                <SalvarProvider
                                    onSaved={(savedData) => {
                                        console.log('Valor de onSaved:', savedData);
                                        // If savedData is just an ID string, convert it to an object
                                        const objBD = typeof savedData === 'string' ? { _id: savedData } : savedData;
                                        console.log('Valore de objBD:', objBD);
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
                                                        // reset(doc);
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
            </div>
        </>
    );
};

export default GCDemandas;
