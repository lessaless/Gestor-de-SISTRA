import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from "react-router-dom";

import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import AutorForm from '../AutorForms';

import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import DirinfraTextArea from '../../DirinfraTextArea/DirinfraTextArea';
import DirinfraListSelect from '../../DirinfraSelect/DirinfraListSelect';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import Dicionario from '../../../utils/Dicionario';

import DisciplinasForm from '../DisciplinasForm';
import PalavrasChaveForm from '../PalavrasChaveForm';
import SolucaoForm from '../SolucaoForm';

import { useForm, useFormContext } from 'react-hook-form';
import { useSalvar } from '../../../utils/SalvarContext';

import {
    listarDados,
    onError,
    onSubmit,
    receberArquivo,
    redirecionar
} from '../../../utils/gerCrud';


const Modelo = "Estudo Técnico Preliminar de Engenharia";// Nome para o título no front

const useStyles = makeStyles(theme => ({
    _: {
        width: '35%'
    },
    keywordsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5px',
        marginBottom: '15px',
        marginTop: '-15px',
        width: '65%'
    },
    keywordBlock: {
        backgroundColor: 'var(--color-bg2)',
        color: 'var(--color-font4Light)',
        padding: '2px 8px',
        borderRadius: '5px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
    },
    removeButton: {
        marginLeft: '8px',
        cursor: 'pointer',
        color: 'var(--color-font4Light)',
        fontWeight: 'bold',
        '&:hover': {
            color: 'var(--botao-deletar)',
        },
    },

    iconeCopiar: {
        fontSize: '.8rem !important',
        cursor: 'pointer !important',
        marginLeft: '4px'
    }
}));

const EstudoTPEngenhariaForm = () => {

    const classes = useStyles();

    const contexto = useFormContext();        // pode ser undefined
    const localForm = useForm();        // sempre chamado
    const metodo = contexto || localForm;
    const { onSaved, onDesvincular } = useSalvar() || {}; // pega função do pai
    const { register, handleSubmit, formState: { errors, isDirty }, reset, control, setValue, getValues, watch } = metodo;

    const data = watch();
    const { id, id_demanda } = useParams();//se for para editar, pega id na url
    const pagina = id || data?._id ? 'Editar' : 'Criar';
    const colecao = 'estudotpengenharia';

    const [arquivo, setArquivo] = useState(null);
    const [arquivoAlterado, setArquivoAlterado] = useState(false);

    // Manipulador de erro apenas para o componente arquivo
    const [temErroArquivo, setTemErroArquivo] = useState(false);

    const [cns, setCNs] = useState([]);

    const atualizarIsDirty = (estado) => {// ATUALIZA EXIBIÇÃO DO BOTÃO SALVAR
        setArquivoAlterado(estado);
    };

    useEffect(() => {
        if (onDesvincular) {
            onDesvincular(() => {
                setValue("id_demanda", "_desvincular");
            });
        }
    }, [onDesvincular]);

    // useEffect para mapear a lista de cns do banco
    useEffect(() => {
        const fetchCNs = async () => {
            try {
                const listaCNs = await listarDados({ 'colecao': 'cadernodenecessidades' });
                // Pega o id_demanda do formulário atual
                const currentIdDemanda = data?.id_demanda || id_demanda;
                console.log("Valor de currentIdDemanda é", currentIdDemanda)
                // Filtra os CNs que têm o mesmo id_demanda
                const cnsFilteredByDemanda = currentIdDemanda
                    ? listaCNs.filter(cn => cn.id_demanda === currentIdDemanda)
                    : listaCNs;
                const newLista = [...cnsFilteredByDemanda, { id_gerais: 'Não se aplica' }];
                setCNs(newLista);

            } catch (error) {
                toast.error("Erro ao carregar a lista de CNs");
            }
        };
        fetchCNs();
    }, [data?.id_demanda, id_demanda]); // Adiciona as dependências para recarregar quando mudar

    useEffect(() => {
        const carregarArquivo = async () => {
            try {
                if (data.arquivo_id) {
                    const arquivoObj = await receberArquivo(data.arquivo_id);
                    setArquivo(arquivoObj);
                };

            } catch (error) {
                toast.error(error.message || "Erro ao carregar arquivo.");
            }
        }

        carregarArquivo();
    }, [data.arquivo_id]);//atualiza se receber arquivo

    useEffect(() => {// CASO RECEBA ID NA URL, BUSCA DADOS DO ID
        async function buscarDado() {

            //setIsLoading(true);
            try {
                const data = {
                    colecao,
                    "filtro": {
                        "_id": id
                    }
                }

                const resp = await listarDados(data);

                //formatar as datas para o formulário string > Date > ISOString
                window.dataParaFormulario(resp[0]);
                reset(resp[0]);



                //setIsLoading(false);

            } catch (error) {
                toast.error(error.message);

                // setTimeout(() => {//se o id for inválido...
                //     redirecionar('Listar');
                // }, 1500);

            }
        };

        if (!id || contexto) return;//Busca dados caso tenha recebido id no URL
        buscarDado();
    }, [id]);



    const aoEnviar = async (data) => {

        const listaChaves = Object.keys(data);
        data.colecao = colecao;
        data.arquivo = arquivo;

        if (data.id_demanda === "_desvincular") {
            data.id_demanda = null; // remove mesmo
        } else if (!data.id_demanda && id_demanda) {
            data.id_demanda = id_demanda; // mantém valor do params se não veio do form
        }

        try {

            if (data.autores.length === 0) throw new Error("É necessário ter pelo menos um autor!");
            if (data.solucoes.length === 0) throw new Error("É necessário ter pelo menos uma solução!");

            const resp = await onSubmit(data, pagina, listaChaves, Modelo);//Modelo = confirmarID
            console.log(`o valor de resp em ETPE Form ${data}`)
            onSaved?.(resp.obj.id_demanda ? resp.obj : null); // avisa o pai (se existir) que salvou, passando o ID do documento salvo (ou null se não vinculou a demanda)
            // se vinculou a demanda, passa o _id do doc salvo para o pai (GCDemandas) atualizar a lista de peças
            // se não vinculou ou desvinculou, passa null para o pai (GCDemandas)

            toast.success(resp.message);

            window.dataParaFormulario(resp.obj);
            reset({ ...getValues(), ...resp.obj });//mantém os valores do formulário e atualiza com os que vierem

            if (window.opener) {//opener é a janela que abriu este componente como popup
                window.opener.atualizarPagina();//executa a função global no opener (atualizarPagina está no App.jsx)
                setTimeout(() => {
                    window.close();//aguarda um tempo para fechar o componente atual para o toast ser exibido
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

    const copiarID = (id) => {
        navigator.clipboard.writeText(id);
        toast.info('Identificador copiado para a área de transferência.');
    }


    // return (
    //     <EmConstrucao /* titulo={"Página em Construção"} mensagem="Página não encontrada" */ />
    // );


    return (
        <>

            {/* <div className='formulario-content'>
            </div> */}

            <div className='formulario-titulo'>
                <h3>Formulário para numeração de {Modelo}</h3>
            </div>

            <div className='formulario-main'>

                <div className='formulario-content'>

                    <div className='linha'>
                        <em className="obrigatorios">*</em>
                        <DirinfraInput
                            name='titulo_doc'
                            erros={errors}
                            label={Dicionario('titulo_doc')}
                            placeholder='Ex.: Reforma de subestação de energia'
                            registro={register}
                            required={true}
                        />
                    </div>

                    <div className='linha'>
                        <em className="obrigatorios">*</em>
                        <DirinfraInput
                            name='data_doc'
                            erros={errors}
                            label='Data do ETPE'
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={true}
                            type='date'
                        />
                    </div>

                    <div className='linha'>
                        {cns?.length > 0 ? (
                            <DirinfraListSelect
                                label='Caderno de Necessidades'
                                name='id_cn'
                                registro={register}
                                required={true}
                                options={cns.map(cn => ({
                                    value: cn.id_gerais,
                                    label: `${cn.id_gerais}`
                                }))}
                                setValue={setValue}
                                erros={errors}
                                placeholder='Selecione o CN ao qual esse ETPE está associado'
                                watch={watch}
                            />
                        ) : (
                            <input
                                placeholder='Nenhum Caderno de Necessidades disponível'
                                disabled
                                style={{
                                    width: '100%',
                                    margin: '12px',
                                    padding: '4px',
                                    textAlign: 'center',
                                }}
                            />
                        )
                        }
                    </div>

                    <div className='linha'>
                        <DirinfraInput
                            name='doc_sigadaer'
                            erros={errors}
                            label={Dicionario('doc_sigadaer')}
                            placeholder='Ex.: Ofício nº XXX/YYYYY/ZZZZ'
                            registro={register}
                            required={false}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraInput
                            name='data_sigadaer'
                            erros={errors}
                            label={Dicionario('data_sigadaer')}
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={false}
                            type='date'
                        />
                    </div>


                    <DisciplinasForm register={register} errors={errors} control={control} setValue={setValue} watch={watch} />

                    <PalavrasChaveForm register={register} errors={errors} control={control} setValue={setValue} watch={watch} />

                    <AutorForm register={register} errors={errors} control={control} setValue={setValue} watch={watch} />

                    <SolucaoForm register={register} errors={errors} control={control} setValue={setValue} watch={watch} />

                    <div className='linha'>
                        {/* <em className="obrigatorios">*</em> */}
                        <DirinfraTextArea
                            name='obs_gerais'
                            erros={errors}
                            label='Observações'
                            placeholder='Digite aqui as informações relevantes que não foram destacadas nos campos anteriores.'
                            registro={register}
                        /* required={true} */
                        />
                    </div>

                </div>


                <div className='formulario-content'>
                    {data?.id_gerais ? (
                        <>
                            <p>Documento numerado como {Modelo} nº <em className='identificador'>{data.id_gerais}</em>
                                <ContentCopyIcon className={classes.iconeCopiar}
                                    onClick={() => copiarID(data.id_gerais)}
                                    title={"Clique para copiar o Identificador"}/* não funciona */
                                />
                            </p>

                            {/* Só exibe o aviso caso não tenha _id nos dados (sem arquivo no BD) */}
                            {/* {!data?.arquivo_id && (<p>Válido por 30 dias sem upload de arquivo.</p>)} */}

                            <GerenciadorDeArquivo arquivo={arquivo} setArquivo={setArquivo} atualizarIsDirty={atualizarIsDirty} temErroArquivo={temErroArquivo} setTemErroArquivo={setTemErroArquivo} />
                        </>

                    ) : (
                        <p>Salve o documento para gerar um Identificador.</p>
                    )}
                </div>
            </div>

            <div className='coluna nota'>
                <p><em className="obrigatorios">*</em> Elementos obrigatórios</p>
            </div>

            <div className='linha'>
                <button
                    className='btn'
                    type="submit"
                    disabled={!isDirty && !arquivoAlterado && !contexto}
                    onClick={() => handleSubmit(aoEnviar, aoErrar)()}
                >
                    Salvar
                </button>
            </div>
        </>
    );

};

export default EstudoTPEngenhariaForm;
