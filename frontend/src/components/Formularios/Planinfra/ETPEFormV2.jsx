import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from "react-router-dom";

import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import AutorForm from '../AutorForms';

import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import DirinfraTextarea from '../../DirinfraTextarea/DirinfraTextarea';
import DirinfraListSelect from '../../DirinfraSelect/DirinfraListSelect';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import Dicionario from '../../../utils/Dicionario';

import DisciplinasForm from '../DisciplinasForm';
import PalavrasChaveForm from '../PalavrasChaveForm';
import SolucaoForm from '../SolucaoForm';

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
    const { register, handleSubmit, formState: { errors, isDirty }, reset, control, setValue, getValues, watch } = useForm();
    const data = watch();

    const { id } = useParams();//se for para editar, pega id na url
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

    // useEffect para mapear a lista de cns do banco
    useEffect(() => {
        const fetchCNs = async () => {
            try {
                const listaCNs = await listarDados({ 'colecao': 'cadernodenecessidades' });
                const newLista = [...listaCNs, { id_gerais: 'Não se aplica' }];
                setCNs(newLista);

            } catch (error) {
                toast.error("Erro ao carregar a lista de CNs");
            }
        };
        fetchCNs();
    }, []);

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

                if (resp[0].arquivo_id) {
                    const arquivoObj = await receberArquivo(resp[0].arquivo_id);
                    setArquivo(arquivoObj);
                };

                //setIsLoading(false);

            } catch (error) {
                toast.error(error.message);

                setTimeout(() => {//se o id for inválido...
                    redirecionar('Listar');
                }, 1500);

            }
        };

        if (!id) return;//Busca dados caso tenha recebido id no URL
        buscarDado();
    }, [id]);



    const aoEnviar = async (data) => {

        const listaChaves = Object.keys(data);
        data.colecao = colecao;
        data.arquivo = arquivo;

        try {

            if (data.autores.length === 0) throw new Error("É necessário ter pelo menos um autor!");
            if (data.solucoes.length === 0) throw new Error("É necessário ter pelo menos uma solução!");

            const resp = await onSubmit(data, pagina, listaChaves, Modelo);//Modelo = confirmarID

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
                        <DirinfraTextarea
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
                    disabled={!isDirty && !arquivoAlterado}
                    onClick={() => handleSubmit(aoEnviar, aoErrar)()}
                >
                    Salvar
                </button>
            </div>
        </>
    );

};

export default EstudoTPEngenhariaForm;
