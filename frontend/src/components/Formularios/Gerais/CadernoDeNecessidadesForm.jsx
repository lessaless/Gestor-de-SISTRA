import React, { useState, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from "react-router-dom";

import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import AutorForm from '../AutorForms';

import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import DirinfraTextarea from '../../DirinfraTextarea/DirinfraTextarea';
// import DirinfraListSelect from '../../DirinfraSelect/DirinfraListSelect';
import utilService from '../../../services/utilService';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DirinfraCopiaButton from '../../DirinfraCopiaButton/DirinfraCopiaButton';
import { DirinfraCopyButton as CopyBtn } from '../../DirinfraCopiaButton/DirinfraCopiaButton';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';
import DirinfraSelectModal from '../../DirinfraSelect/DirinfraSelectModal';
import DisciplinasForm from '../DisciplinasForm';
import PalavrasChaveForm from '../PalavrasChaveForm';
// ========================================================= //
import PeriodoDeElaboracaoForm from '../PeriodoDeElaboracaoForm';
// Calcula o tempo total de produção do documento: GLA
// ========================================================= // 
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
// import DirinfraSelectModal from '../../DirinfraSelect/DirinfraSelectModal';


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
    const [fasesDoProjeto, setFasesDoProjeto] = useState([]);
    // ================== //
    // useState do SISTRA //
    // ================== //
    const [agenteCausadorAcidente, setAgenteCausadorAcidente] = useState([]);
    const [situacaoGeradora, setSituacaoGeradora] = useState([]);
    const [parteDoCorpoAtingida, setParteDoCorpoAtingida] = useState([]);
    // ================== //
    // fim useState do SISTRA //
    // ================== //
    const [temErroArquivo, setTemErroArquivo] = useState(false);
    const [isDesvinculating, setIsDesvinculating] = useState(false);

    const atualizarIsDirty = (estado) => {// ATUALIZA EXIBIÇÃO DO BOTÃO SALVAR
        setArquivoAlterado(estado);
    };

    useEffect(() => {
        if (onDesvincular) {
            onDesvincular(() => {
                console.log("Dentro de onDesvincular, desvinculei");
                setIsDesvinculating(true); // ✅ Set flag to true
                setValue("id_demanda", "_desvincular");
            });
        }
    }, [onDesvincular, setValue]);

    // Encontrando o valor de idDemanda:
    const currentIdDemanda = data?.id_demanda || id_demanda;
    const demandaSelecionada = demandas.find(d =>
        d._id === currentIdDemanda || d.id_demanda === currentIdDemanda
    );
    // const estadoDemanda = demandaSelecionada?.estado_demanda ?? '';
    // const benfeitoriaDemanda = demandaSelecionada?.benfeitoria_bim ?? '';

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

            } catch (error) {
                toast.error(error.message);
            }
        };

        if (!id || contexto) return;//Busca dados caso tenha recebido id no URL

        buscarDado();
    }, [id]);

    const aoEnviar = async (data) => {
        data.colecao = colecao;
        data.arquivo = arquivo;
        // console.log("valor de data.disciplinasAutores", data.disciplinasAutores)
        // ✅ Use the state variable instead of checking data
        // console.log("Valor de isDesvinculating é", isDesvinculating);

        // ✅ Handle desvincular - send null so backend knows to unset it
        if (isDesvinculating || data.id_demanda === "_desvincular") {
            data.id_demanda = null; // Backend will handle this with $unset
        } else if (!data.id_demanda && id_demanda) {
            data.id_demanda = id_demanda;
        }
        try {
            // console.log("Entrei no try.")

            // if (data.autores.length === 0) {
            //     console.log("valor de data.autores.length", data.autores.length)
            //     throw new Error("É necessário ter pelo menos um autor!");
            // } antes de 26/11/2025: GLA
            // Validações básicas
            if (!data.disciplinasAutores || data.disciplinasAutores.length === 0) {
                throw new Error("É necessário ter pelo menos um autor!");
            }

            const autoresInvalidos = data.disciplinasAutores.filter(
                autor => !autor.nome_militar || autor.nome_militar.trim().length === 0
            );

            if (autoresInvalidos.length > 0) {
                throw new Error("Todos os autores devem ter uma pessoa selecionada!");
            }
            // console.log("antes de listaChaves")
            let listaChaves = Object.keys(data);
            // console.log("Valor de listaChaves é", listaChaves)
            //Backend agora gera os códigos BIM automaticamente
            const resp = await onSubmit(data, pagina, listaChaves, Modelo);

            console.log("Valor de response:", resp);

            // Only add id_demanda back if NOT desvinculating
            if (!isDesvinculating && data.id_demanda && !resp.obj.id_demanda) {
                resp.obj.id_demanda = data.id_demanda;
            }

            // ✅ Use the state flag
            onSaved?.(isDesvinculating ? null : resp.obj);

            console.log("Valor de response é", resp);
            toast.success(resp.message);

            // Mostra o código gerado pelo backend se houver
            if (resp.obj.codigo_documento_bim) {
                toast.info(`Código Documento BIM gerado: ${resp.obj.codigo_documento_bim}`, {
                    position: "top-right",
                    autoClose: 10000,
                });
            }

            window.dataParaFormulario(resp.obj);

            // Decide o valor final para manter (preferencialmente backend; fallback to what user selected)
            let faseFinal =
                resp?.obj?.fase_do_projeto ??
                data?.fase_do_projeto ??
                '';

            // Normalizar para string
            faseFinal = String(faseFinal);

            // Carregando o payload para reset
            const dadosParaReset = {
                ...getValues(),
                ...resp.obj,
                fase_do_projeto: faseFinal
            };

            // Reset e setando os parâmetros
            reset(dadosParaReset);

            // Use setTimeout para garantir que setValue aconteça
            // após reset se completa.
            setTimeout(() => {
                setValue('fase_do_projeto', faseFinal, {
                    shouldDirty: false,
                    shouldValidate: false
                });
            }, 0);

            // ✅ Reset the flag after successful save
            setIsDesvinculating(false);

            if (window.opener) {
                window.opener.atualizarPagina();
                setTimeout(() => window.close(), 1500);
            }

        } catch (error) {
            toast.error(error.message);
            // ✅ Reset flag on error too
            setIsDesvinculating(false);
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
                setDemandas(listaDemandas.data)
            } catch (error) {
                toast.error("Erro ao carregar a lista de demandas");
            }
        };

        fetchDemandas();
    }, []);

    useEffect(() => {
        //console.log("Mapear lista oms")
        const fetchFasesDoProjeto = async () => {
            try {
                // const listaOMs = await utilService.obterOMs();
                // const listaODS = await utilService.obterODS();
                const listaFasesDoProjeto = await utilService.obterFasesDoProjeto();
                // setOms(listaOMs.data);
                // setOds(listaODS.data);
                setFasesDoProjeto(listaFasesDoProjeto.data);
                console.log("Valores de Fases do Projeto é ", listaFasesDoProjeto.data)

            } catch (error) {
                toast.error("Erro ao carregar Fases do Projeto");
            }
        };

        fetchFasesDoProjeto();
    }, []);


    useEffect(() => {
        //console.log("Mapear lista oms")
        const fetchAgenteCausadorAcidente = async () => {
            try {
                // const listaOMs = await utilService.obterOMs();
                // const listaODS = await utilService.obterODS();
                const listaAgenteCausadorAcidente = await utilService.obterAgenteCausadorAcidentes();
                console.log("Valor de listaAgenteCausadorAcidente é", listaAgenteCausadorAcidente)
                // setOms(listaOMs.data);
                // setOds(listaODS.data);
                setAgenteCausadorAcidente(listaAgenteCausadorAcidente.data);
                console.log("Valores de Agente Causador do Acidente é ", listaAgenteCausadorAcidente.data)

            } catch (error) {

                toast.error("Erro ao carregar Agente Causador do Acidente.");
            }
        };

        fetchAgenteCausadorAcidente();
    }, []);

    useEffect(() => {
        //console.log("Mapear lista oms")
        const fetchSituacaoGeradora = async () => {
            try {
                // const listaOMs = await utilService.obterOMs();
                // const listaODS = await utilService.obterODS();
                const listaSituacaoGeradora  = await utilService.obterSituacaoGeradoras ();
                console.log("Valor de listaSituacaoGeradora  é", listaSituacaoGeradora )
                // setOms(listaOMs.data);
                // setOds(listaODS.data);
                setSituacaoGeradora(listaSituacaoGeradora .data);
                console.log("Valores de Situação Geradora é ", listaSituacaoGeradora .data)

            } catch (error) {

                toast.error("Erro ao carregar Situação Geradora.");
            }
        };

        fetchSituacaoGeradora();
    }, []);

    useEffect(() => {
        //console.log("Mapear lista oms")
        const fetchParteDoCorpoAtingida = async () => {
            try {
                // const listaOMs = await utilService.obterOMs();
                // const listaODS = await utilService.obterODS();
                const listaParteDoCorpoAtingida = await utilService.obterParteDoCorpoAtingidas();
                console.log("Valor de listaParteDoCorpoAtingida é", listaParteDoCorpoAtingida)
                // setOms(listaOMs.data);
                // setOds(listaODS.data);
                setParteDoCorpoAtingida(listaParteDoCorpoAtingida.data);
                console.log("Valores de Parte do Corpo Atingida é ", listaParteDoCorpoAtingida.data)

            } catch (error) {

                toast.error("Erro ao carregar Parte do Corpo Atingida.");
            }
        };

        fetchParteDoCorpoAtingida();
    }, []);

    return (
        <>
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
                    <DirinfraSelect
                        label='Fase Do Projeto'
                        name='fase_do_projeto'
                        registro={register}
                        required={true}
                        options={fasesDoProjeto.map(fp => ({
                            value: String(fp.codigo),   // <- stringify to match form value
                            label: fp.titulo,
                        }))}
                        erros={errors}
                        placeholder='Selecione a Fase do Documento'
                        watch={watch}
                        setValue={setValue}
                        value={watch('fase_do_projeto') ?? ''} // <- controlled by RHF
                    />


                    <DirinfraSelectModal
                        label='Agente Causador do Acidente' // interfere no nome dentro da caixa de 
                        // seleção 
                        name='agente_causador_acidente'
                        registro={register}
                        required={true}
                        options={agenteCausadorAcidente.map(fp => ({
                            value: String(fp.codigo),
                            label: fp.descricao,
                            code: fp.codigo,  // Add this line to display the codigo!
                        }))}
                        erros={errors}
                        placeholder='Selecione o Agente Causador do Acidente'
                        watch={watch}
                        setValue={setValue}
                        value={watch('agente_causador_acidente') ?? ''}
                    />

                    <DirinfraSelectModal
                        label='Situação Geradora' // interfere no nome dentro da caixa de 
                        // seleção 
                        name='situacao_geradora'
                        registro={register}
                        required={true}
                        options={situacaoGeradora.map(fp => ({
                            value: String(fp.codigo),
                            label: fp.situacaogeradora,
                            code: fp.codigo,  // Add this line to display the codigo!
                        }))}
                        erros={errors}
                        placeholder='Selecione a Situação Geradora'
                        watch={watch}
                        setValue={setValue}
                        value={watch('situacao_geradora') ?? ''}
                    />
                    <DirinfraSelectModal
                        label='Parte do Corpo Atingida' // interfere no nome dentro da caixa de 
                        // seleção 
                        name='parte_do_corpo_atingida'
                        registro={register}
                        required={true}
                        options={parteDoCorpoAtingida.map(fp => ({
                            value: String(fp.codigo),
                            label: fp.descricao,
                            code: fp.codigo,  // Add this line to display the codigo!
                        }))}
                        erros={errors}
                        placeholder='Selecione a Parte do Corpo Atingida'
                        watch={watch}
                        setValue={setValue}
                        value={watch('parte_do_corpo_atingida') ?? ''}
                    />
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
                            addon={
                                <CopyBtn
                                    name="codigo_documento_bim"
                                    label="Código Documento BIM"
                                    // optional: pass inputProps.getValues if you want copy to use a provided getValues function:
                                    inputProps={{ getValues }}
                                    size={34}
                                />
                            }
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
                            name='data_ocorrencia'
                            erros={errors}
                            label={Dicionario('data_ocorrencia')}
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={false}
                            type='date'
                        />
                    </div>

                    <DisciplinasForm register={register} errors={errors} control={control} setValue={setValue} watch={watch} />

                    <PalavrasChaveForm register={register} errors={errors} control={control} setValue={setValue} watch={watch} />

                    {/* <AutorForm register={register} errors={errors} control={control} setValue={setValue} watch={watch} /> */}
                    <div className='linha'>
                        <DirinfraInput
                            name='data_inicio_confecc_doc'
                            erros={errors}
                            label={Dicionario('data_inicio_confecc_doc')}
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={false}
                            type='date'
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraInput
                            name='data_entrega_doc'
                            erros={errors}
                            label={Dicionario('data_entrega_doc')}
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={false}
                            type='date'
                            min={watch('data_inicio_confecc_doc') || undefined} // ✅ HTML5 validation
                            validar={{  // ✅ React Hook Form validation (already supported by DirinfraInput)
                                afterOrEqualStart: (value) => {
                                    const dataInicio = watch('data_inicio_confecc_doc');
                                    if (!value || !dataInicio) return true;
                                    return value >= dataInicio ||
                                        'A data de entrega não pode ser anterior à data de início';
                                }
                            }}
                        />
                    </div>
                    <PeriodoDeElaboracaoForm
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                    />

                    <div className='linha'>
                        <DirinfraTextarea
                            name='obs_gerais'
                            erros={errors}
                            label='Observações'
                            placeholder='Digite aqui as informações relevantes que não foram destacadas nos campos anteriores.'
                            registro={register}
                        />
                    </div>

                </div>

                <div className='formulario-content'>
                    {data?.id_gerais ? (
                        <>
                            <p>Documento numerado como {Modelo} nº <em className='identificador'>{data.id_gerais}</em>
                                <ContentCopyIcon className={classes.iconeCopiar}
                                    onClick={() => copiarID(data.id_gerais)}
                                    title={"Clique para copiar o Identificador"}
                                />
                            </p>

                            <GerenciadorDeArquivo
                                arquivo={arquivo}
                                setArquivo={setArquivo}
                                atualizarIsDirty={atualizarIsDirty}
                                temErroArquivo={temErroArquivo}
                                setTemErroArquivo={setTemErroArquivo}
                            />
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