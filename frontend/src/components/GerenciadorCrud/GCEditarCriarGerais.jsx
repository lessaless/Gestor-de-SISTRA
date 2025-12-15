import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { toast } from 'react-toastify';

import bgLinkDemanda from '../../imgs/bgLinkDemanda.jpg';

import GerenciadorDeArquivo from '../GerenciadorDeArquivo/GerenciadorDeArquivo';
import DirinfraInput from '../DirinfraInput/DirinfraInput';
import DirinfraSelect from '../DirinfraSelect/DirinfraSelect';
import Dicionario from '../../utils/Dicionario';
import Loading from '../Loader/Loading';
//import AbasFluxo from '../AbasFluxo/AbasFluxo';

import userService from '../../services/userService';
import { formulariosGerais } from "../../utils/ColecaoModelo"

import {
    atualizarChaves,
    deletarDado,
    listarDados,
    onError,
    onSubmit,
    receberArquivo,
    redirecionar
} from '../../utils/gerCrud';



const useStyles = makeStyles(theme => ({
    content: {
        backgroundColor: 'var(--color-bg1)',
        minHeight: 'calc(100vh - var(--topbar-height) - 170px)',
        padding: '0 10px 10px'
    },
    contentEscolha: {
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        justifyContent: 'center',
        marginTop: '20px',
        padding: '10px',
    },
    contentEscolhaBoxes: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'center',
        marginTop: '20px',
        padding: '10px',
    },
    colecaoEscolha: {
        alignItems: 'center',
        border: '1px solid var(--color-borderdefault)',
        borderRadius: '4px',
        boxShadow: '0 0 8px 0px var(--color-shadow)',
        cursor: 'pointer',
        display: 'flex',
        height: '400px',
        justifyContent: 'center',
        width: '40%',

        '&:hover': {
            backgroundColor: 'var(--color-hover)',
            boxShadow: '0 0 8px 1px var(--color-shadow)',
            color: 'var(--color-font4light)'
        },

        '& > label': {
            fontSize: '30px',
            textAlign: 'center'
        }
    },
    colecaoEscolhaBoxes: {
        alignItems: 'center',
        border: '1px solid var(--color-borderdefault)',
        borderRadius: '4px',
        boxShadow: '0 0 8px 0px var(--color-shadow)',
        cursor: 'pointer',
        display: 'flex',
        height: '200px',  // Reduced from 400px
        justifyContent: 'center',
        width: '30%',      // Reduced from 40% to fit 3 per row
        minWidth: '200px', // Added to prevent boxes from getting too small
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: 'var(--color-hover)',
            boxShadow: '0 8px 16px 2px var(--color-shadow)',
            color: 'var(--color-font4light)',
            transform: 'translateY(-10px)',
            '& > label': {
                fontWeight: 'bold',           // Makes it bold (negrito)
                textDecoration: 'underline',  // Adds underline
            } // 
        },

        '& > label': {
            fontSize: '20px',  // Reduced from 30px
            textAlign: 'center',
            padding: '10px',   // Added padding for better text spacing
        }
    },
    marginTop: {
        marginTop: '40px'
    },

    bgDivDemanda: {
        border: '1px solid var(--color-borderdefault)',
        borderRadius: '4px',
        boxShadow: 'inset 0 0 6px 0px var(--color-borderdefault)',
        marginBottom: '10px',
        padding: '30px',
        backgroundImage: `linear-gradient(
            color-mix(in srgb, var(--color-bg1) 95%, transparent),
            color-mix(in srgb, var(--color-bg3) 95%, transparent)
        ), url(${bgLinkDemanda})`,
        backgroundAttachment: 'scroll, fixed',
        // backgroundRepeat: 'no-repeat, no-repeat',
        // backgroundSize: 'auto, cover',
        // backgroundPosition: 'center, center'
    },
    textoLinkDemanda: {
        fontFamily: 'sans-serif',
        color: 'var(--color-font4light)'
    },
}));

const GCEditar = () => {

    const classes = useStyles();
    const location = useLocation();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm();

    const id_demanda = watch('id_demanda');

    const { id, _colecao } = useParams();
    const [colecao, setColecao] = useState(_colecao);
    //const [colecao, setColecao] = useState("Selecionar");
    const [pagina, setPagina] = useState(id ? 'Editar' : 'Criar');

    const [isLoading, setIsLoading] = useState(false);

    const [arquivo, setArquivo] = useState();
    const [listaChaves, setListaChaves] = useState([]);

    const [msgObrigatorios, setMsgObrigatorios] = useState(false);
    const [msgAutomaticos, setMsgAutomaticos] = useState(false);
    const [arquivoAlterado, setArquivoAlterado] = useState(false);
    const [temArquivo, setTemArquivo] = useState(false);

    const [usuarioOM, setUsuarioOM] = useState(null);
    const [colecoesFiltradas, setColecoesFiltradas] = useState([]);

    // console.log("Estou em GCEditarCriar.jsx")
    // Busca o usuário e ajusta as coleções
    useEffect(() => {
        async function buscarUsuario() {
            try {
                const user = await userService.verificaLogin();
                setUsuarioOM(user.data?.OM);
            } catch (error) {
                console.error("Erro ao buscar usuário:", error.message);
            }
        }

        buscarUsuario();
    }, []);

    // Filtra coleções com base em usuarioOM
    useEffect(() => {
        // Clona a coleção original para preservar os dados
        if (!usuarioOM) return;
        const colecoes = Object.keys(formulariosGerais); // Assumindo que formulariosGerais contém as coleções

        if (usuarioOM !== 'DIRINFRA') {
            const colecoesFiltradas = colecoes.filter(colecao => colecao !== 'ordemtecnica');
            setColecoesFiltradas(colecoesFiltradas);

        } else {
            setColecoesFiltradas(colecoes);

        }
    }, [usuarioOM]);

    // Implementação provisória. Demanda deve salvar {'demandas': true, 'cns': false, 'etpes': false, ...} para saber quais etapas do fluxo existem
    // const objColecoes = { 'demandas': true, 'cns': true, 'users': false, 'grupos': false };
    // const objColecoes = { 'demandas': false,/*  'cns': true */ };

    // Para retornar ao "menu" de escolha
    useEffect(() => {
        //Quando tem _colecao (vem do url) é 'Editar' ou 'Cadastrar coleção específica', deve passar direto pela escolha;
        if (_colecao) setColecao(_colecao); // COM ESSA LINHA ADICIONA-SE OS CARTÕES DE "Fluxo PLANINFRA" e "Documentos Independentes"
        else setColecao("Selecionar"); // COM ESSA LINHA ELIMINA-SE OS CARTÕES DE "Fluxo PLANINFRA" e "Documentos Independentes" 
        setPagina(id ? 'Editar' : 'Criar');
        /* Sempre que alterar a lógica acima, verificar:
        - Criar novo documento pelo link 'Cadastrar';
        - Criar documento de coleção específica '/cadastrar/colecao';
        - Editar documento existente.
        */
    }, [location.pathname]);


    useEffect(() => {// FUNCIONA COMO UM RESET()
        function resetarFormulario() {
            const objReset = {};
            listaChaves.forEach(key => {
                objReset[key.nome] = '';
            });
            reset(objReset);
            if (arquivo) setArquivo('');
        }

        if (id) return;//Se tem id, é para buscar dados para Editar, não reseta
        resetarFormulario();
    }, [colecao, listaChaves, id]);

    useEffect(() => {
        if (colecoesFiltradas.length === 0) return;
        if (pagina === 'Editar') return;//Se for edição, não verifica a coleção

        if (_colecao && !colecoesFiltradas.includes(_colecao)) {
            toast.error('Acesso não autorizado a esta coleção.');
            setColecao("Selecionar");

        } else {
            setColecao(_colecao || "Selecionar");

        }
    }, [colecoesFiltradas]);


    useEffect(() => {// LER CHAVES PARA GERAR CAMPOS
        async function lerChaves() {
            try {
                const respChaves = await atualizarChaves(colecao);
                setListaChaves(respChaves.listaChaves);
                setTemArquivo(respChaves.temArquivo);

            } catch (error) {
                toast.error(error);
            }
        };

        /* if(id) return; */
        lerChaves();
    }, [])


    useEffect(() => {// CASO RECEBA ID NA URL, BUSCA DADOS DO ID
        async function buscarDado() {

            setIsLoading(true);
            try {
                const data = {
                    colecao,
                    "filtro": {
                        "_id": id
                    }
                }

                const resp = await listarDados(data);

                reset(resp[0]);

                // if (resp[0].arquivo_id) {
                //     const arquivoObj = await receberArquivo(resp[0].arquivo_id);
                //     setArquivo(arquivoObj);
                // };

                setIsLoading(false);

            } catch (error) {
                toast.error(error.message);

                // setTimeout(() => {//se o id for inválido...
                //     redirecionar('Listar');
                // }, 1500);

            }
        };

        if (!id) return;//Busca dados caso tenha recebido id no URL
        buscarDado();
    }, [id]);


    const aoEnviar = async (data) => {
        data.colecao = colecao;
        data.arquivo = arquivo;
        try {
            const resp = await onSubmit(data, pagina, listaChaves);
            toast.success(resp.message);
            reset(resp.obj);

            if (window.opener) {//opener é a janela que abriu este componente como popup
                window.opener.atualizarPagina();//executa a função global no opener (atualizarPagina está no App.jsx)
                setTimeout(() => {
                    window.close();//fecha o componente atual após um tempo para o toast ser exibido
                }, 1500);

            }

        } catch (error) {
            toast.error(error.message);
        }
    };

    const aoErrar = (errors) => {
        try {
            onError(errors);
        } catch (error) {
            toast.error(error.message);
        }
    }

    const aoDeletar = async (obj) => {
        try {
            const resp = await deletarDado(obj, colecao);
            toast.success(resp.message);

            setTimeout(() => {
                redirecionar('Listar');
            }, 1000);

        } catch (error) {
            toast.error(error.message);
        }
    };


    useEffect(() => {// EXIBE MENSAGENS DE ELEMENTOS OBRIGATÓRIOS E/OU AUTOMÁTICOS
        const temObrigatorio = listaChaves.some(obj => obj.obrigatorio === true);
        const temAutomatico = listaChaves.some(obj => obj.automatico === true);
        setMsgObrigatorios(temObrigatorio);
        setMsgAutomaticos(temAutomatico);
    }, [listaChaves]);


    const atualizarIsDirty = (estado) => {// ATUALIZA EXIBIÇÃO DO BOTÃO SALVAR
        setArquivoAlterado(estado);
    };

    //Função para voltar na página com o botão voltar
    const voltar = () => {
        // navigate('/main/home/cadastrar'); // Volta para a página de cadastro
        navigate(-1); // o -1 emula o botao voltar do navegador
        window.location.reload()
    };

    if (!colecao && !id) {//Selecionar tipo de objeto para Criar, se tiver ID é edição, não seleciona
        return (
            <div className={classes.content}>
                <label>Escolha o tipo de objeto:</label>
                <div className={classes.contentEscolha}>
                    <div className={classes.colecaoEscolha} onClick={() => setColecao('Selecionar')}>
                        <label>Fluxo PLANINFRA</label>
                    </div>
                    <div className={classes.colecaoEscolha} onClick={() => setColecao('gerais')}>
                        <label>Documento Independente</label>
                    </div>
                </div>
            </div>
        );
    }
    // antes de 04/12/2025; Este "if" gera o seletor de documento tipo GERAIS
    // if (colecao === 'Selecionar') return (//Selecionar objeto do fluxo PPI/PEI
    //     <div className={classes.content}>
    //         <div className={classes.contentEscolha}>
    //             <DirinfraSelect
    //                 label="Selecione o tipo de documento"
    //                 options={colecoesFiltradas.map(colecao => ({
    //                     value: colecao,
    //                     label: formulariosGerais[colecao]?.nome || '<Sem Nome>',
    //                 }))}
    //                 onChange={(e) => setColecao(e.target.value)}
    //                 name="fluxoTipodeDocumento"
    //                 registro={register}
    //             />
    //         </div>
    //     </div>
    // );


    // ===== Usando boxes no lugar de seletor ===== //
    if (colecao === 'Selecionar') {
        const primeiraLinha = colecoesFiltradas.slice(0, 3);
        const segundaLinha = colecoesFiltradas.slice(3, 7);

        return (
            <div className={classes.content}>
                <label>Selecione o tipo de documento:</label>

                {/* Primeira linha com 3 itens */}
                <div className={classes.contentEscolhaBoxes}>
                    {primeiraLinha.map((colecaoItem) => (
                        <div
                            key={colecaoItem}
                            className={classes.colecaoEscolhaBoxes}
                            onClick={() => setColecao(colecaoItem)}
                        >
                            <label>{formulariosGerais[colecaoItem]?.nome || '<Sem Nome>'}</label>
                        </div>
                    ))}
                </div>

                {/* Segunda linha com 4 itens */}
                <div className={classes.contentEscolhaBoxes}>
                    {segundaLinha.map((colecaoItem) => (
                        <div
                            key={colecaoItem}
                            className={classes.colecaoEscolhaBoxes}
                            onClick={() => setColecao(colecaoItem)}
                        >
                            <label>{formulariosGerais[colecaoItem]?.nome || '<Sem Nome>'}</label>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    // ===== Fim uso de boxes ===== //
    if (formulariosGerais[colecao] /* && (pagina !== 'Editar') */) return (//Se existir formulário específico, renderiza
        <div className={classes.content}>
            {pagina !== 'Editar' && (
                <button onClick={voltar} className="btn-voltar">Voltar</button>
            )}
            {id_demanda && (
                <div className={classes.bgDivDemanda}>
                    <span className={classes.textoLinkDemanda}>
                        Documento vinculado à demanda ID:{' '}
                        <a href="#" style={{ color: 'var(--color-link)' }} onClick={(e) => {
                            e.preventDefault();
                            redirecionar(
                                'Editar',
                                { colecao: 'demandas', id_demanda },
                                'popup',//popup abre em nova janela, main redireciona
                                'planinfra'
                            );
                        }}>
                            {id_demanda}
                        </a>
                    </span>
                </div>
            )}
            {formulariosGerais[colecao].componente}
        </div>
    );

    if (listaChaves.length === 0) return (<div className={classes.content}><label>Nenhum dado foi encontrado.</label></div>);
    if (id && isLoading) return <Loading personalizarEstilo={{ backgroundColor: 'transparent' }} />

    //Render para formulário genérico e edições
    return (
        <><div className={classes.content}>

            {/* <AbasFluxo colecao={colecao} setColecao={setColecao} objColecoes={objColecoes} /> */}

            <div className={classes.marginTop}></div>

            <div className='formulario-titulo'>
                <h3>Formulário Automático</h3>
            </div>

            <div className='formulario-main'>

                <div className='formulario-content'>
                    {listaChaves.map((chave, index) => (
                        <div className='linha' key={index}>
                            {chave.obrigatorio && !chave.automatico ? (<em className="obrigatorios">*</em>) : ''}
                            <DirinfraInput
                                disabled={chave.automatico}
                                name={chave.nome}
                                erros={errors}
                                label={Dicionario(chave.nome)}
                                placeholder={chave.tipo}
                                registro={register}
                                required={chave.obrigatorio && !chave.automatico}
                            /* l={650-(Dicionario(chave.nome).length)*9}//largura em pixels */
                            />
                        </div>
                    ))}
                </div>

                {temArquivo && (
                    <div className='formulario-content'>
                        <GerenciadorDeArquivo arquivo={arquivo} setArquivo={setArquivo} atualizarIsDirty={atualizarIsDirty} />
                    </div>
                )}
            </div>

            {(msgObrigatorios || msgAutomaticos) && (
                <div className='coluna nota'>
                    {msgObrigatorios && (<p>Elementos obrigatórios: <em className="obrigatorios">*</em></p>)}
                    {msgAutomaticos && (<p>Elementos desabilitados: São preenchidos automaticamente. Clique duplo para sobrescrever.</p>)}
                </div>
            )}

            <div className='linha' style={{ justifyContent: 'space-between' }}>

                <button
                    className='btn'
                    type="submit"
                    disabled={!isDirty && !arquivoAlterado} // Habilita o botão se isDirty ou arquivoAlterado for verdadeiro
                    onClick={() => handleSubmit(aoEnviar, aoErrar)()}
                >
                    Salvar
                </button>


                {(pagina === 'Editar') && (
                    <div className='linha'>
                        {/* <button
                            className='novo'
                            onClick={() => setPagina('Criar')}
                        >
                            {'Criar novo'}
                        </button> */}

                        {/* <button
                            type="submit"
                            className='deletar'
                            onClick={() => aoDeletar(obj)}
                        >
                            Deletar
                        </button> */}
                    </div>
                )}

            </div>
        </div>
        </>
    );
};

export default GCEditar;