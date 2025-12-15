import React, { useState, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from "react-router-dom";

import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import AutorForm from '../AutorForms';

import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import DirinfraTextarea from '../../DirinfraTextarea/DirinfraTextarea';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import DisciplinasForm from '../DisciplinasForm';
import PalavrasChaveForm from '../PalavrasChaveForm';

import demandaService from '../../../services/demandaService';
import Dicionario from '../../../utils/Dicionario';
import { useSalvar } from '../../../utils/SalvarContext';

import {
    listarDados,
    onError,
    onSubmit,
    receberArquivo,
    redirecionar
} from '../../../utils/gerCrud';


const Modelo = "Caderno de Necessidades";// Nome para o título no front

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

const CadernoDeNecessidadesForm = () => {

    const classes = useStyles();

    const contexto = useFormContext();        // pode ser undefined
    const localForm = useForm();        // sempre chamado
    const metodo = contexto || localForm;
    const { onSaved, onDesvincular } = useSalvar() || {}; // pega função do pai
    const { register, handleSubmit, formState: { errors, isDirty }, reset, control, setValue, getValues, watch } = metodo;


    const data = watch();
    const { id, id_demanda } = useParams();//se for para editar, pega id na url
    const pagina = id || data?._id ? 'Editar' : 'Criar';
    const colecao = 'cadernodenecessidades'

    const [arquivo, setArquivo] = useState(null);
    const [arquivoAlterado, setArquivoAlterado] = useState(false);
    const [demandas, setDemandas] = useState([]);
    const currentId = watch('id_demanda');
    const [codigoProjetoBimGerado, setCodigoProjetoBimGerado] = useState('');
    const [codigoDocumentoBimGerado, setCodigoDocumentoBimGerado] = useState('');
    // Manipulador de erro apenas para o componente arquivo
    const [temErroArquivo, setTemErroArquivo] = useState(false);

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
    // Encontrando o valor de idDemanda:
    const currentIdDemanda = data?.id_demanda || id_demanda;
    // console.log("Valor de currentIdDemanda é ", currentIdDemanda)
    const demandaSelecionada = demandas.find(d =>
        d._id === currentIdDemanda || d.id_demanda === currentIdDemanda   // cobre _id OU código humano
    );
    const estadoDemanda = demandaSelecionada?.estado_demanda ?? '';
    console.log(`O valor de estadoDemanda: ${estadoDemanda}`);
    const benfeitoriaDemanda = demandaSelecionada?.benfeitoria_bim ?? '';
    console.log(`O valor de benfeitoriaDemanda : ${benfeitoriaDemanda}`);
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


    // Busca a próxima sequência para o codigoprojeto
    const buscarProximaSequencia = async (estado, localidade, benfeitoria) => {
        try {
            const filtro = {
                estado_demanda: estado,
                localidade_demanda: localidade,
                benfeitoria: benfeitoria
            };

            const resultado = await listarDados({
                colecao: 'codigoprojetos',
                filtro,
                sort: { sequencia_numerica: -1 },
                limit: 1
            });

            let novaSequencia = 1;

            if (resultado && resultado.length > 0 && resultado[0].sequencia_numerica) {
                const sequenciaAtual = parseInt(resultado[0].sequencia_numerica);
                novaSequencia = sequenciaAtual + 1;
            }

            // Formatar com zero à esquerda (01, 02, ..., 99)
            return novaSequencia.toString().padStart(2, '0');

        } catch (error) {
            console.error("Erro ao buscar sequência:", error);
            return '01'; // Valor padrão em caso de erro
        }
    };
    // Busca a próxima sequência para os três últimos caracteres 
    // representam a sequência numérica de documentos do mesmo tipo, a 
    // partir do 001

    const buscarProximaSequenciaNNN = async (tipoDocumento) => {
        try {
            const filtro = {
                __t: tipoDocumento,  // Filtra por tipo de documento
                id_demanda: { $exists: true, $ne: null }  // APENAS documentos COM demanda
            };

            console.log("Buscando sequência NNN com filtro:", filtro);

            const resultado = await listarDados({
                colecao: 'gerais',
                filtro,
                sort: { sequencia_numerica_nnn: -1 },
                limit: 1
            });

            console.log("Resultado da busca:", resultado);
            console.log("Quantidade de resultados:", resultado?.length);

            let novaSequencia = 1;

            if (resultado && resultado.length > 0) {
                console.log("Primeiro resultado:", resultado[0]);
                console.log("sequencia_numerica_nnn do resultado:", resultado[0].sequencia_numerica_nnn);

                if (resultado[0].sequencia_numerica_nnn) {
                    const sequenciaAtual = parseInt(resultado[0].sequencia_numerica_nnn);
                    console.log("Sequência atual (número):", sequenciaAtual);
                    novaSequencia = sequenciaAtual + 1;
                }
            } else {
                console.log("Nenhum resultado encontrado, começando em 001");
            }

            console.log("Nova sequência:", novaSequencia);

            return novaSequencia.toString().padStart(3, '0');

        } catch (error) {
            console.error("Erro ao buscar sequência NNN:", error);
            return '001';
        }
    };


    const salvarCodigoProjeto = async (codigoProjetoBim, codigoDocumentoBim, estado,
        localidade, benfeitoria, sequenciaNumerica, sequenciaNumericaNNN) => {
        try {
            const dadosCodigoProjeto = {
                colecao: 'codigoprojetos',
                codigo_projeto_bim: codigoProjetoBim,
                codigo_documento_bim: codigoDocumentoBim,
                estado_demanda: estado,
                localidade_demanda: localidade,
                benfeitoria: benfeitoria,
                sequencia_numerica: sequenciaNumerica,
                sequencia_numerica_nnn: sequenciaNumericaNNN,
                id_demanda: currentIdDemanda
            };

            // Check if a record with this combination already exists
            const existente = await listarDados({
                colecao: 'codigoprojetos',
                filtro: {
                    id_demanda: currentIdDemanda,
                    estado_demanda: estado,
                    localidade_demanda: localidade,
                    benfeitoria: benfeitoria,
                    sequencia_numerica: sequenciaNumerica
                }
            });

            let resp;
            if (existente && existente.length > 0) {
                // Atualizando...
                dadosCodigoProjeto._id = existente[0]._id;
                const listaChaves = Object.keys(dadosCodigoProjeto);
                resp = await onSubmit(dadosCodigoProjeto, 'Editar', listaChaves, 'Código Projeto');
            } else {
                // Create new record
                const listaChaves = Object.keys(dadosCodigoProjeto);
                resp = await onSubmit(dadosCodigoProjeto, 'Criar', listaChaves, 'Código Projeto');
            }

            return resp;
        } catch (error) {
            console.error("Erro ao salvar código projeto:", error);
            throw error;
        }
    };


    const aoEnviar = async (data) => {

        data.colecao = colecao;
        data.arquivo = arquivo;

        if (data.id_demanda === "_desvincular") {
            data.id_demanda = null; // remove mesmo
            console.log("Valor de data.id_demanda é", data.id_demanda)
        } else if (!data.id_demanda && id_demanda) {
            data.id_demanda = id_demanda;
            console.log("Valor de data.id_demanda é", data.id_demanda)// mantém valor do params se não veio do form
        }
        console.log("Valor de data.colecao é", data.colecao)
        // console.log("Salvando dados...", data);
        try {
            console.log("Valor de data.autores.length é", data.autores.length)
            // console.log("Valor de data.solucoes.length é", data.solucoes.length)
            if (data.autores.length === 0) throw new Error("É necessário ter pelo menos um autor!");
            // if (data.solucoes.length === 0) throw new Error("É necessário ter pelo menos uma solução!");
            console.log("valor de demandas é", demandas)
            const dSel = demandas.find(d =>
                d._id === currentIdDemanda || d.id_demanda === currentIdDemanda   // cobre _id OU código humano
            );
            console.log("O valor de dSel é ", dSel)
            // === BUSCAR DADOS DA DEMANDA SELECIONADA ===
            data.estado_demanda = dSel?.estado_demanda ?? '';
            console.log("Valor de data.estado_demanda é ", data.estado_demanda)
            data.localidade_demanda = dSel?.localidade_demanda ?? '';
            data.benfeitoria = dSel?.benfeitoria_bim ?? '';
            const estado = data.estado_demanda;
            const localidade = data.localidade_demanda ?? '';
            const benfeitoria = data.benfeitoria ?? '';
            const fase_do_projeto = "EP";
            const LL = "CN"
            const tipoDocumento = "CadernoDeNecessidades"; // hardcoded

            const proximoLL = await buscarProximaSequenciaNNN(tipoDocumento)
            console.log("Valor de proximoLL é ", proximoLL)
            console.log("Valor de tipoDocumento é", tipoDocumento)
            const disciplina = "GER"
            console.log("Valor de disciplina é ", disciplina);


            // === GERAR SEQUÊNCIA NUMÉRICA (apenas se for novo registro) ===
            if (!data.sequencia_numerica && (pagina === 'Editar' || pagina === 'Criar')) {
                data.sequencia_numerica = await buscarProximaSequencia(estado, localidade, benfeitoria);
                data.sequencia_numerica_nnn = await buscarProximaSequenciaNNN(tipoDocumento);;
                console.log("Valor de data.sequencia_numerica_nnn é", data.sequencia_numerica_nnn)
                console.log("Valor de proximoLL é", proximoLL)

            }

            let sequencia = data.sequencia_numerica || '';
            let sequenciaNNN = data.sequencia_numerica_nnn || '';
            console.log("Sequência 2 dígitos:", sequencia);
            console.log("Sequência 3 dígitos:", sequenciaNNN);
            // Verificando se há demanda associada
            if (currentIdDemanda) {
                data.codigo_projeto_bim = `${estado}${localidade}-${benfeitoria}${fase_do_projeto}${sequencia}`;
                data.codigo_documento_bim = `${estado}${localidade}-${benfeitoria}${fase_do_projeto}${sequencia}-${disciplina}-${LL}${sequenciaNNN}`;
                console.log("Valor de currentIdDemanda é ", currentIdDemanda)
                console.log("Valor de data.codigo_documento_bim dentro do if é ", data.codigo_documento_bim)
                setCodigoProjetoBimGerado(data.codigo_projeto_bim);
                setCodigoDocumentoBimGerado(data.codigo_documento_bim);
                await salvarCodigoProjeto(
                    data.codigo_projeto_bim,
                    data.codigo_documento_bim,
                    estado,
                    currentId,
                    localidade,
                    benfeitoria,
                    sequencia,
                    sequenciaNNN,
                    LL

                );
                data.sequencia_numerica_nnn = sequenciaNNN;
                // toast.info(`Código Projeto BIM gerado: ${data.codigo_projeto_bim}`, {
                //     position: "top-right",
                //     autoClose: 10000,
                // });
            } else {
                sequencia = '';
                data.sequencia_numerica = undefined;  // ou delete data.sequencia_numerica
                data.codigo_documento_bim = undefined;  // ou delete data.codigo_documento_bim
                data.sequencia_numerica_nnn = undefined;  // ou delete data.sequencia_numerica_nnn
                setCodigoProjetoBimGerado('');
                setCodigoDocumentoBimGerado('');
                console.log("Valor de currentIdDemanda é ", currentIdDemanda)
                console.log("Valor de data.codigo_documento_bim dentro do else é ", data.codigo_documento_bim)
            }
            console.log("Valor de currentIdDemanda é ", currentIdDemanda)
            console.log("Valor de data.codigo_codigo_bim fora dos loops é ", data.codigo_projeto_bim)

            // 
            let listaChaves = Object.keys(data);
            console.log("Valor de listaChaves é ", listaChaves)



            console.log("Valor de codigo_documento_bim:", data.codigo_documento_bim);
            console.log("Valor de data é:", data);
            console.log("Valor de listaChaves é:", listaChaves);
            console.log("Valor de pagina é:", pagina);
            // === SALVAR DOCUMENTO === (this saves to estudotpengenharia collection)
            const resp = await onSubmit(data, pagina, listaChaves, Modelo);
            console.log("valor de resp é ", resp)
            if (data.id_demanda && !resp.obj.id_demanda) {
                resp.obj.id_demanda = data.id_demanda;
            }

            onSaved?.(data.id_demanda === "_desvincular" ? null : resp.obj);

            toast.success(resp.message);
            if (currentIdDemanda) {
                toast.info(`Código Projeto BIM gerado: ${data.codigo_documento_bim}`, {
                    position: "top-right",
                    autoClose: 10000,
                });
            }

            window.dataParaFormulario(resp.obj);
            reset({ ...getValues(), ...resp.obj });

            if (window.opener) {
                window.opener.atualizarPagina();
                setTimeout(() => {
                    window.close();
                }, 1500);
            }

        }
        catch (error) {
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

    useEffect(() => {
        const fetchDemandas = async () => {
            try {
                const listaDemandas = await demandaService.lerDemandas();
                // console.log("lista de demandas obtida", listaDemandas.data);
                // console.log("lista de estado_demanda obtida", listaDemandas.data[0]?.estado_demanda);

                // const opcaoNovaDemanda = [
                //     { apelido_demanda: '', id_demanda: 'Não se aplica' },
                //     ...listaDemandas.data
                // ];

                // setDemandas(opcaoNovaDemanda);
                setDemandas(listaDemandas.data)
            } catch (error) {
                toast.error("Erro ao carregar a lista de demandas");
            }
        };

        fetchDemandas();
    }, []);
    useEffect(() => {
        if (codigoProjetoBimGerado) {
            setValue('codigo_projeto_bim', codigoProjetoBimGerado);
            console.log("Valor de codigoProjetoBimGerado", codigoProjetoBimGerado)
        }
    }, [codigoProjetoBimGerado, setValue]);

    useEffect(() => {
        if (codigoDocumentoBimGerado) {
            setValue('codigo_documento_bim', codigoDocumentoBimGerado);
            console.log("Valor de codigoDocumentoBimGerado", codigoDocumentoBimGerado)
        }
    }, [codigoDocumentoBimGerado, setValue]);

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
                            placeholder='Ex.: Análise de solicitação de aditivo de fundações'
                            registro={register}
                            required={true}
                        />
                    </div>

                    <div className='linha'>
                        <em className="obrigatorios">*</em>
                        <DirinfraInput
                            name='data_doc'
                            erros={errors}
                            label='Data do Caderno de Necessidades'
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={true}
                            type='date'
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraInput
                            name='codigo_documento_bim'
                            erros={errors}
                            label='Código Documento BIM'
                            placeholder='Apenas se atrelado a demanda.'
                            registro={register}
                            required={false}
                            disabled={true}
                        />
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
                    disabled={!isDirty && !arquivoAlterado && !contexto}
                    onClick={() => handleSubmit(aoEnviar, aoErrar)()}
                >
                    Salvar
                </button>
            </div>
        </>
    );

};

export default CadernoDeNecessidadesForm;
