import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { toast } from 'react-toastify';
import { useParams } from "react-router-dom";


// import AttachFileIcon from '@mui/icons-material/AttachFile';
import PDFIcon from '../../imgs/pdf.png';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
/* import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit'; */
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SwapVertIcon from '@mui/icons-material/SwapVert';

import DirinfraSelect from '../DirinfraSelect/DirinfraSelect';
import DirinfraDetalhes from '../DirinfraDetalhes/DirinfraDetalhes';
import Dicionario from '../../utils/Dicionario';
import Paginacao from '../Paginacao/Paginacao';

import utilService from '../../services/utilService'

import {
    atualizarChaves,
    deletarDado,
    editarDado,
    listarDados
} from '../../utils/gerCrud';

import { formulariosPlaninfra } from "../../utils/ColecaoModelo"
const colecoes = Object.keys(formulariosPlaninfra);


const useStyles = makeStyles(theme => ({
    checkboxDivMain: {
        alignItems: 'center',
        border: 'dashed 1px var(--color-borderdefault)',
        borderRadius: '4px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '30px',
        justifyContent: 'center',
        padding: '10px',
        margin: '15px 10px 30px',
        /* width: '100%' */
    },
    checkboxDivItem: {
        display: 'flex',
        gap: '5px',
        userSelect: 'none',
        '& > input, & > label': {
            cursor: 'pointer'
        }
    },
    verIcone: {
        /* color: 'var(--botao-novo)', */
        width: '25px',
        '&:hover': {
            cursor: 'pointer'
        }
    },
    editarIcone: {
        color: 'var(--botao-editar)',
        '&:hover': {
            cursor: 'pointer'
        }
    },
    deletarIcone: {
        color: 'var(--botao-deletar)',
        '&:hover': {
            cursor: 'pointer'
        }
    },
    Tabela: {
        borderRadius: '4px',
        border: 'dashed 1px var(--color-borderdefault)',
        overflow: 'auto',
        position: 'relative',
        /* overflow: 'hidden', */
        '& > table': {
            minWidth: '100%',
            backgroundColor: 'var(--color-bg4)',
            /* borda dupla não preenchida */
            /* borderCollapse: 'collapse' */
            padding: '0px',
        },
        '& th': {
            padding: '5px',
            /* border: '1px solid var(--color-borderdefault)' */
            maxWidth: '170px',  // Definindo um maxWidth para todas as células
            minWidth: '150px',
            whiteSpace: 'normal',  // Permite quebra de linha
            //wordBreak: 'break-all',  // Quebra palavras se necessário
            wordWrap: 'unset',  // Quebra palavras longas
        },
        '& td': {
            padding: '5px',
            /* border: '1px solid var(--color-borderdefault)' */
            maxWidth: '170px',  // Definindo um maxWidth para todas as células
            minWidth: '150px',
            whiteSpace: 'normal',  // Permite quebra de linha
            wordBreak: 'break-word',  // Quebra palavras se necessário
            wordWrap: 'unset',  // Quebra palavras longas
        }
    },
    tituloTabela: {
        backgroundColor: 'var(--color-theme3)',
        borderRadius: '2px',
        color: 'var(--color-font4dark)',
        position: 'sticky',
        top: 0,
        zIndex: 1,

        '&.clicavel': { // className = tituloTabela && clicavel (ignora 'Ações')
            cursor: 'pointer',
            userSelect: 'none',
        }
    },
    labelTH: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'inherit'
    },
    iconeOrdem: {
        color: 'var(--color-borderLineFocus100)',
        fontSize: '1rem  !important',
        opacity: '0.4'
    },
    iconeOrdemAtivo: {
        color: 'var(--color-borderLineFocus100)',
        fontSize: '1.2rem  !important'
    },

    linhaPar: {
        backgroundColor: 'var(--color-bg1)'
    },
    linhaImpar: {
        backgroundColor: 'var(--color-bg2)'
    },
    ultimaColuna: {
        borderLeft: '1px solid var(--color-bg3)',
        borderRight: '1px solid var(--color-bg3)',
        maxWidth: '136px !important',
        position: 'sticky',
        right: 0,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        zIndex: 1
    },
    botoesUltimaColunaConjunto: {
        display: 'flex',
        width: '100%',
        justifyContent: 'center'
    },
    botoesUltimaColuna: {
        width: '34px'
    },
    nenhumDadoText: {
        textAlign: 'center', 
        padding: '2rem' 
    },
    paginacao: {
        //border: 'solid 1px var(--color-borderdefault)',
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center',
        margin: '25px 4px 5px',
        padding: '4px',

        '& button': {
            backgroundColor: 'var(--color-bg1)',
            color: 'var(--color-font4light)',
            cursor: 'pointer',
            margin: '0',
            padding: '5px 10px',

            '&:disabled': {
                backgroundColor: 'var(--color-disabled)'
            }
        },

        '& label': {
            margin: '10px',
            fontSize: '0.93rem',
            fontWeight: '500'
        },

        '& span': {
            color: 'var(--color-font4light)',
            margin: '0'
        }
    }
}));

const camposVisiveisIniciais = {
    'titulo_demanda': true,
    'tipo': false,
    'terreno': false,
    'benfeitoria': false,
    'om_solicitante': false,
    'om_objeto': false,
    'ods_objeto': false,
    'obs_proj': false,
    'data_alteracao_proj': true,
    'fato_originador': false,
    'detalhe_fato_originador': false,
    'doc_sigadaer': false,
    'detalhes_despacho': false,
    'outro_fato_originador': false,
    'estado_demanda': false,
    'cidade_demanda': false,
    'status_cn': false,
    'tipo_doc': false,
    'data_sigadaer': false,
    'data_doc': false,
    'criado_por': false,
    'modificado_por': false,
    'autores': false,
    'solucoes': false,
    'solucao_etpe_escolhida': false,
    'g_gut': false,
    't_gut': false,
    'u_gut': false,
    'categoria_infraestrutura': false,
    'classe_proposta': false,
    'atividade_fim_proposta': false,
    'pmp_proposta': false,
    'repeticao_proposta': false,
    'plano_diretor_proposta': false,
    '__v': false,

    //"id_demanda": false,


}

const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(+valor);
};


const GCListar = () => {

    //const colecao = 'demandas'; (sem seletor de colecao)
    const classes = useStyles();
    const { register } = useForm();
    const { _colecao } = useParams();
    const [colecao, setColecao] = useState(_colecao || colecoes[0]);
    const [colecaoAnterior, setColecaoAnterior] = useState(colecao);//backup para recuperar quando dá erro
    const [checkBloqueado, setCheckBloqueado] = useState('');
    const [listaChaves, setListaChaves] = useState([]);
    const [dados, setDados] = useState([]);
    const [efetivo, setEfetivo] = useState({});
    const [ordenacao, setOrdenacao] = useState({ campo: null, ordem: null });

    const verificarPadraoId = (valor) => {
        // const regex = /^([a-z]+)-\d+-[A-Za-z]+-\d{4}$/; // com prefixo
        const regex = /^\d+\/[A-Za-z]+\/\d{4}$/; // sem prefixo
        return regex.test(valor);
    };

    const ordenarDados = (campo) => {
        const primeiroCliqueCampo = ordenacao.campo !== campo;
        let eCrescente;
        if (primeiroCliqueCampo) eCrescente = true; // começar sempre na ordem crescente
        else eCrescente = ordenacao.campo === campo && ordenacao.ordem === 'crescente'; // se já for o campo ordenado, alterna

        const ordenados = [...dados].sort((a, b) => {
            // Trata undefined/null como '' e converte para string, com toLowerCase para todos
            let valorA = a[campo] ? a[campo].toString().toLowerCase() : '';
            let valorB = b[campo] ? b[campo].toString().toLowerCase() : '';

            // Verifica se o campo segue o padrão de IDs
            if (verificarPadraoId(valorA) && verificarPadraoId(valorB)) {

                // Para IDs, vamos ordená-los por ordem numérica ou alfanumérica
                // Vamos separar a parte numérica e a parte do texto para ordenar de forma adequada
                // const [prefixoA, numeroA, omA, anoA] = valorA.split('-'); //com prefixo
                // const [prefixoB, numeroB, omB, anoB] = valorB.split('-'); //com prefixo
                const [numeroA, omA, anoA] = valorA.split('/');
                const [numeroB, omB, anoB] = valorB.split('/');

                // Comparação do ano
                if (parseInt(anoA) < parseInt(anoB)) return eCrescente ? -1 : 1;
                if (parseInt(anoA) > parseInt(anoB)) return eCrescente ? 1 : -1;

                // Comparação alfanumérica do texto
                if (omA < omB) return eCrescente ? -1 : 1;
                if (omA > omB) return eCrescente ? 1 : -1;

                // Comparação numérica
                if (parseInt(numeroA) < parseInt(numeroB)) return eCrescente ? -1 : 1;
                if (parseInt(numeroA) > parseInt(numeroB)) return eCrescente ? 1 : -1;

                return 0; // Se forem iguais, mantém como original

            } else {
                // Para outros valores (não IDs), aplica a comparação padrão
                if (valorA < valorB) return eCrescente ? -1 : 1;
                if (valorA > valorB) return eCrescente ? 1 : -1;
                return 0; // Se forem iguais, mantém como original
            }
        });

        setDados(ordenados);
        // salva a ordenação para a próxima interação
        setOrdenacao({ campo: campo, ordem: eCrescente ? 'decrescente' : 'crescente' });
    };


    const iconeOrdenacao = (campo) => {
        if (ordenacao.campo !== campo) return <SwapVertIcon className={classes.iconeOrdem} />; // se não for o campo em ordenação
        // como a ordem é salva para a próxima interação, aqui o ícone está invertido 'logicamente'
        return ordenacao.ordem === 'crescente' ? <ArrowDownwardIcon className={classes.iconeOrdemAtivo} /> : <ArrowUpwardIcon className={classes.iconeOrdemAtivo} />;
    };

    useEffect(() => {
        // Busca a lista do efetivo e gera um objeto {SARAM: 'POSTO Nome', ...}
        const buscarEfetivo = async () => {
            try {
                const efetivo = await utilService.obterEfetivo();
                const mapaEfetivo = efetivo.data.reduce((acc, item) => {
                    // Converte o POSTO para maiúsculas
                    let posto = item.POSTO?.toUpperCase();
                    // Converte o NOME para iniciais maiúsculas e o restante minúsculo
                    let nome = item.NOME
                        ?.toLowerCase()
                        .split(' ')
                        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
                        .join(' ');

                    acc[item.SARAM] = `${posto} ${nome}`;
                    return acc;
                }, {});

                setEfetivo(mapaEfetivo);//salva para ser usado na lista
            } catch (error) {
                console.error('Erro ao obter a lista do Efetivo:', error);
            }
        };

        if (colecao === 'etpes' || colecao === 'gerenciamentoproj') buscarEfetivo();
    }, [colecao]);



    useEffect(() => {
        async function lerChavesEDados(colecao) {
            try {
                const [respChaves, respDados] = await Promise.all([
                    atualizarChaves(colecao),
                    listarDados({ 'colecao': colecao })
                ]);
                setListaChaves(respChaves.listaChaves);

                const nomesValidos = new Set(respChaves.listaChaves.map(chave => chave.nome));

                //dados para serem exibidos na tabela (com base nas chaves)
                nomesValidos.add('_id');
                nomesValidos.add('arquivo_id');


                const dadosFiltrados = respDados.map(item => {
                    const novoItem = {};
                    Object.keys(item).forEach(chave => {
                        if (nomesValidos.has(chave)) {//Verifica se é um nome válido
                            let valor = item[chave];
                            // Verifica se o valor é uma lista
                            if (Array.isArray(valor)) {
                                // Se a lista contém objetos, aplicar Dicionario a cada valor e converter para string
                                valor = valor.map(obj => {
                                    if (typeof obj === 'object' && obj !== null) {
                                        return Object.keys(obj).map(chave => {

                                            // Aplicar Dicionario a cada valor do objeto e converter para string
                                            if (chave !== '_id') {

                                                //só retorna o par chave-valor se tiver algo, para não aparecer campos vazios (especialidade: '')
                                                let valorPraExibir = obj[chave] ? `${Dicionario(chave)}: ${obj[chave]}` : null;

                                                if (chave === 'SARAM' && colecao === "etpes" || colecao === "gerenciamentoproj") {//pegar nomes e postos dos autores
                                                    return efetivo[obj[chave]] || null;//busca o 'Posto Nome' de acordo com o SARAM no objeto efetivo
                                                }
                                                else if (chave === 'valor_solucao' && colecao === "etpes" || colecao === "gerenciamentoproj") {//formatar valores das soluções
                                                    return `${Dicionario(chave)}: ${formatarMoeda(obj[chave])}` || null;
                                                }
                                                else return valorPraExibir;

                                            }
                                            return null;//Excluir a chave '_id'
                                        })
                                            .filter(Boolean)
                                            .join(', '); // Junta todos os pares chave:valor em uma string
                                    }
                                    return obj; // Caso não seja objeto
                                }).join(', '); // Junta todos os itens da lista em uma string
                            }
                            novoItem[chave] = valor;
                        }
                    });
                    return novoItem;
                });

                //console.log("Dados filtrados", dadosFiltrados)
                setDados(dadosFiltrados);
                setColecaoAnterior(colecao);//se sucesso, usa essa como backup

            } catch (error) {
                toast.error(error.message);
                setColecao(colecaoAnterior);//se erro, usa o backup para recuperar
            }
        };

        lerChavesEDados(colecao);
        //}, []) (sem seletor de colecao)
    }, [colecao, efetivo])

    const [camposVisiveis, setCamposVisiveis] = useState(() => {
        const camposVisiveisNoInicio = {};
        listaChaves.forEach(campo => {
            camposVisiveisNoInicio[campo.nome] = true;
        });
        return camposVisiveisNoInicio;
    });

    const [dadosPaginados, setDadosPaginados] = useState(dados);

    useEffect(() => {
        let camposVisiveis = {};
        if (listaChaves.length > 0) {
            listaChaves.forEach(campo => {
                camposVisiveis[campo.nome] = camposVisiveisIniciais[campo.nome] ?? true;
                //(nullish coalescing) retorna o valor à esquerda se ele não for null nem undefined. Caso contrário, retorna o valor à direita, que nesse caso é true.
            });
        }
        setCamposVisiveis(camposVisiveis);
    }, [listaChaves]);

    const alterarCamposVisiveis = useCallback(campo => {
        setCamposVisiveis(camposVisiveisAnterior => ({
            ...camposVisiveisAnterior,
            [campo]: !camposVisiveisAnterior[campo]
        }));
    }, []);

    const visualizarDado = async obj => {
        obj.colecao = colecao;
        const acao = await DirinfraDetalhes(obj);
        /* acao === 'Listar' && console.log(acao); */
        typeof acao === 'object' && editarDado(obj);
    };

    const deletar = async (obj, colecao) => {
        try {
            const resp = await deletarDado(obj, colecao);

            if (resp) {
                toast.success(resp.message);
                setDados(prevDados => prevDados.filter(d => d._id !== obj._id));//retira da lista na página
            }

        } catch (error) {
            toast.error(error.message);
        }
    };

    const aoSelecionar = (event) => {
        let selecionado = event.target.value;
        setColecao(selecionado);
        // // Atualizar lista de campos visíveis por padrão
        // if (selecionado === 'ETPE') {
        //     camposVisiveisIniciais.data_doc = true;
        // }
        // else {
        //     camposVisiveisIniciais.data_doc = false;
        // }
    }

    function formatarData(data, somarUmDia) {

        if (!data) {
            return colecao === 'gerais' ? 'Nunca' : '';
        }
        const novaData = new Date(data);

        //como sempre a data salva como UTC 0h00, quando converte pra BR aqui retrocede 3 horas
        //e vira D-1. Portanto, deve-se somar 1 dia para essa exibição.
        if (somarUmDia) novaData.setDate(novaData.getDate() + 1); // Soma 1 dia à data original (somente se não for campos que já salva em BRT [creatAt, updateAt, expireAt])

        const opcoes = { year: 'numeric', month: 'long', day: 'numeric' };
        return novaData.toLocaleDateString('pt-BR', opcoes);
    }



    // Exibição das colunas com base nos input checks
    const camposVisiveisLista = useMemo(() => Object.keys(camposVisiveis).filter(campo => camposVisiveis[campo]), [camposVisiveis]);
    const tamCamposVisiveisLista = camposVisiveisLista.length;

    // validação da lista para renderização
    //if (dados.length === 0 || !tamCamposVisiveisLista) return <label>Nenhum dado foi encontrado.</label>;

    // controle para deixar no mínimo 1 input check habilitado
    if (tamCamposVisiveisLista === 1 && !checkBloqueado) setCheckBloqueado(camposVisiveisLista[0]);
    if (tamCamposVisiveisLista === 2 && checkBloqueado) setCheckBloqueado('');


    return (
        <div>

            {/* <div className={classes.pesquisarDiv}>
                <DirinfraSelect
                    label='Selecione o tipo de documento: '
                    name='colecao_seletor'
                    onChange={aoSelecionar}
                    options={colecoes.map(colecao => ({ value: colecao, label: formulariosPlaninfra[colecao].nome }))}
                    registro={register}
                    defaultValue={colecoes[0]}
                    value={colecao}
                />
            </div> */}

            {(dados.length === 0 || !tamCamposVisiveisLista) ? (<div className={classes.nenhumDadoText}><strong>Nenhum dado foi encontrado.</strong> </div>) : (
                <>
                    <Paginacao
                        /* uso no SeletorMultiplo */
                        titulo="Selecionar colunas"
                        listaChaves={listaChaves}
                        camposVisiveis={camposVisiveis}
                        alterarCamposVisiveis={alterarCamposVisiveis}
                        checkBloqueado={checkBloqueado}
                        /* uso componente */
                        dados={dados}
                        setDadosPaginados={setDadosPaginados}
                    />

                    <div className={classes.Tabela}>

                        <table>
                            <thead>
                                <tr>
                                    {camposVisiveisLista.map((campo, index) => (
                                        <th
                                            key={index}
                                            className={classes.tituloTabela + ' clicavel'}
                                            onClick={() => ordenarDados(campo)}// ordenar dados ao clicar
                                        >
                                            <label className={classes.labelTH}>
                                                {Dicionario(campo)}{iconeOrdenacao(campo)}
                                            </label>
                                        </th>
                                    ))}
                                    <th className={classes.ultimaColuna + ' ' + classes.tituloTabela}>Ações</th>
                                </tr>
                            </thead>
                            <tbody className={classes.conteudoTabela}>
                                {dadosPaginados.map((obj, index) => {
                                    const linhaClassName = index % 2 === 0 ? classes.linhaPar : classes.linhaImpar;
                                    return (
                                        <tr key={index} className={linhaClassName}>
                                            {camposVisiveisLista.map((campo, idx) => (
                                                // <td key={idx}>{obj[campo]}</td>
                                                <td key={idx}>
                                                    {campo.startsWith('data') ? formatarData(obj[campo], true) :
                                                        ['expireAt', 'createdAt', 'updatedAt'].includes(campo) ? formatarData(obj[campo]) :
                                                            obj[campo]}
                                                </td>
                                            ))}
                                            <td className={classes.ultimaColuna + ' ' + linhaClassName}>
                                                <span className={classes.botoesUltimaColunaConjunto}>
                                                    {obj.arquivo_id ? (
                                                        <span className={classes.botoesUltimaColuna} title='Baixar anexo'>
                                                            <img src={PDFIcon} className={classes.verIcone} onClick={(e) => {
                                                                e.preventDefault();
                                                                let url = `${process.env.REACT_APP_BACKEND}/api/arquivo/baixar/${obj.arquivo_id}`;
                                                                const link = document.createElement('a');
                                                                link.href = url;
                                                                document.body.appendChild(link);
                                                                link.click();
                                                                document.body.removeChild(link);
                                                            }} />
                                                        </span>
                                                    ) : <span className={classes.botoesUltimaColuna} />}
                                                    {/* <span className={classes.botoesUltimaColuna} title='Visualizar'>
                                                        <VisibilityIcon className={classes.verIcone} onClick={() => visualizarDado(obj)} />
                                                    </span> */}
                                                    <span className={classes.botoesUltimaColuna} title='Abrir'>
                                                        <OpenInBrowserIcon className={classes.editarIcone} onClick={() => editarDado(obj, colecao)} />
                                                    </span>
                                                    <span className={classes.botoesUltimaColuna} title='Deletar'>
                                                        <DeleteIcon className={classes.deletarIcone} onClick={() => deletar(obj, colecao)} />
                                                    </span>
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                </>
            )}

        </div>
    );
};

export default GCListar;
