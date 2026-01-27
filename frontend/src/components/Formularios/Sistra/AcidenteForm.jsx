import React, { useState, useEffect } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from "react-router-dom";

import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import AutorForm from '../AutorForms';

import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import DirinfraTextArea from '../../DirinfraTextArea/DirinfraTextArea';
// import DirinfraListSelect from '../../DirinfraSelect/DirinfraListSelect';
import utilService from '../../../services/utilService';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DirinfraCopiaButton from '../../DirinfraCopiaButton/DirinfraCopiaButton';
import { DirinfraCopyButton as CopyBtn } from '../../DirinfraCopiaButton/DirinfraCopiaButton';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';
import DirinfraSelectModal from '../../DirinfraSelect/DirinfraSelectModal';
import DisciplinasForm from '../DisciplinasForm';
import DirinfraListSelect from '../../DirinfraSelect/DirinfraListSelect';
import PalavrasChaveForm from '../PalavrasChaveForm';

import DirinfraInputNumerico from '../ContagemForm';

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


const Modelo = "Acidente";// Nome para o título no front

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

function normalizeUF(v) {
    return String(v ?? '').trim().toUpperCase();
}
function parseAreaToUFs(area) {
    return String(area ?? '')
        .split('/')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);
}

function normalizeText(v) {
    return String(v ?? '')
        .trim()
        .toLowerCase()
        .normalize('NFD')                 // remove accents
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Recebe "YYYY-MM-DD" e retorna o weekday em pt-BR (ex.: "segunda-feira")
 */
function weekdayPtBRFromISODate(isoDateStr) {
    if (!isoDateStr) return '';
    // HTML date input gives YYYY-MM-DD
    const d = new Date(`${isoDateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(d);
}

/**
 * Tenta mapear o weekday ("segunda-feira") para um item do seu array diadaSemana
 * Aceita variações de nome de campo: descricao, dia, nome, etc.
 */
function findDiaSemanaByLabel(diadasemanaList, weekdayLabelPtBR) {
    const target = normalizeText(weekdayLabelPtBR);
    if (!target) return null;

    return (diadasemanaList || []).find((item) => {
        const label =
            item?.descricao ??
            item?.dia ??
            item?.nome ??
            item?.diadasemana ??
            item?.label;

        return normalizeText(label) === target;
    }) || null;
}

function getDiaSemanaLabelFromCodigo(diadasemanaList, codigo) {
    if (!codigo) return '';
    const found = (diadasemanaList || []).find((x) => String(x?.codigo) === String(codigo));
    return found?.descricao ?? found?.dia ?? found?.nome ?? '';
}

const AcidenteForm = () => {

    const classes = useStyles();

    const contexto = useFormContext();        // pode ser undefined
    const localForm = useForm();        // sempre chamado
    const metodo = contexto || localForm;
    const { onSaved, onDesvincular } = useSalvar() || {}; // pega função do pai
    const { register, handleSubmit, formState: { errors, isDirty }, reset, control, setValue, getValues, watch } = metodo;

    const data = watch();
    const watchedUF = normalizeUF(watch('estado_demanda')); // <-- UF from RHF
    const watchedDataOcorrencia = watch('data_ocorrencia');
    const watchedDiaSemanaCodigo = watch('dia_da_semana');
    const watchedDispensaAfastamento = watch('dispensa_afastamento');
    // const isDispensaDisabled = !watchedDispensaAfastamento?.includes('Sim');
    const isDispensaDisabled =
        !(
            watchedDispensaAfastamento?.includes('Sim') ||
            watchedDispensaAfastamento?.includes('SIM')
        );
    useEffect(() => {
        if (isDispensaDisabled) {
            setValue('descricao_dispensa', '', { shouldDirty: true });
            setValue('duracao_dispensa', '', { shouldDirty: true });
        }
    }, [isDispensaDisabled, setValue]);
    const { id, id_demanda } = useParams();//se for para editar, pega id na url
    const pagina = id || data?._id ? 'Editar' : 'Criar';
    const colecao = 'acidentes'

    const [arquivo, setArquivo] = useState(null);
    const [arquivoAlterado, setArquivoAlterado] = useState(false);
    const [demandas, setDemandas] = useState([]);
    const [fasesDoProjeto, setFasesDoProjeto] = useState([]);
    const [oms, setOms] = useState([]);

    const [estadosList, setEstadosList] = useState([]);
    const [estadoSelecionado, setEstadoSelecionado] = useState('');


    // ================== //
    // useState do SISTRA //
    // ================== //
    const [agenteCausadorAcidente, setAgenteCausadorAcidente] = useState([]);
    const [situacaoGeradora, setSituacaoGeradora] = useState([]);
    const [parteDoCorpoAtingida, setParteDoCorpoAtingida] = useState([]);
    const [houveDispensa, setHouveDispensa] = useState([]);
    const [naturezaDaAtividade, setNaturezaDaAtividade] = useState([]);
    const [tipoDeAcidente, setTipoDeAcidente] = useState([]);
    const [statusFinal, setStatusFinal] = useState([]);
    const [diadaSemana, setDiaDaSemana] = useState([]);
    const [gravidadeAcidentes, setGravidadeAcidentes] = useState([]);


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
            // if (!data.disciplinasAutores || data.disciplinasAutores.length === 0) {
            //     throw new Error("É necessário ter pelo menos um autor!");
            // }

            // const autoresInvalidos = data.disciplinasAutores.filter(
            //     autor => !autor.nome_militar || autor.nome_militar.trim().length === 0
            // );

            // if (autoresInvalidos.length > 0) {
            //     throw new Error("Todos os autores devem ter uma pessoa selecionada!");
            // }
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


    // useEffect(() => {
    //     //console.log("Mapear lista oms")
    //     const fetchAgenteCausadorAcidente = async () => {
    //         try {
    //             // const listaOMs = await utilService.obterOMs();
    //             // const listaODS = await utilService.obterODS();
    //             const listaAgenteCausadorAcidente = await utilService.obterAgenteCausadorAcidentes();
    //             console.log("Valor de listaAgenteCausadorAcidente é", listaAgenteCausadorAcidente)
    //             // setOms(listaOMs.data);
    //             // setOds(listaODS.data);
    //             setAgenteCausadorAcidente(listaAgenteCausadorAcidente.data);
    //             console.log("Valores de Agente Causador do Acidente é ", listaAgenteCausadorAcidente.data)

    //         } catch (error) {

    //             toast.error("Erro ao carregar Agente Causador do Acidente.");
    //         }
    //     };

    //     fetchAgenteCausadorAcidente();
    // }, []);

    // useEffect(() => {
    //     //console.log("Mapear lista oms")
    //     const fetchSituacaoGeradora = async () => {
    //         try {
    //             // const listaOMs = await utilService.obterOMs();
    //             // const listaODS = await utilService.obterODS();
    //             const listaSituacaoGeradora = await utilService.obterSituacaoGeradoras();
    //             console.log("Valor de listaSituacaoGeradora  é", listaSituacaoGeradora)
    //             // setOms(listaOMs.data);
    //             // setOds(listaODS.data);
    //             setSituacaoGeradora(listaSituacaoGeradora.data);
    //             console.log("Valores de Situação Geradora é ", listaSituacaoGeradora.data)

    //         } catch (error) {

    //             toast.error("Erro ao carregar Situação Geradora.");
    //         }
    //     };

    //     fetchSituacaoGeradora();
    // }, []);

    useEffect(() => {
        //console.log("Mapear lista oms")
        const fetchHouveDispensa = async () => {
            try {
                // const listaOMs = await utilService.obterOMs();
                // const listaODS = await utilService.obterODS();
                console.log("Entrei em fetchHouveDispensa")
                const listaHouveDispensa = await utilService.obterHouveDispensas();
                console.log("Valor de HouveDispensa é", listaHouveDispensa)
                // setOms(listaOMs.data);
                // setOds(listaODS.data);
                setHouveDispensa(listaHouveDispensa.data);
                console.log("Valores de Houve Dispensa é ", listaHouveDispensa.data)

            } catch (error) {

                toast.error("Erro ao carregar Houve Dispensa.");
            }
        };

        fetchHouveDispensa();
    }, []);
    // // useEffect para mapear a lista de oms e ods do banco
    useEffect(() => {
        //console.log("Mapear lista oms")
        const fetchOms = async () => {
            try {
                const listaOMs = await utilService.obterOMs();
                // const listaODS = await utilService.obterODS();
                const listaEstados = await utilService.obterEstados();
                setOms(listaOMs.data);
                // setOds(listaODS.data);
                setEstadosList(listaEstados.data);
                console.log("Valor de listaEstados.data é", listaEstados.data)
            } catch (error) {
                toast.error("Erro ao carregar OMs, ODS ou Estados");
            }
        };

        fetchOms();
    }, []);

    // // useEffect para mapear a lista de gravidadeAcidentes do banco
    useEffect(() => {
        //console.log("Mapear lista gravidadeAcidentes")
        const fetchGravidadeAcidentes = async () => {
            try {
                const listaGravidadeAcidentes = await utilService.obterGravidadeAcidentes();
                // const listaODS = await utilService.obterODS();
                setGravidadeAcidentes(listaGravidadeAcidentes.data);
                console.log("Valor de listaGravidadeAcidentes.data é", listaGravidadeAcidentes.data)
            } catch (error) {
                toast.error("Erro ao carregar Lista Gravidade Acidentes.");
            }
        };

        fetchGravidadeAcidentes();
    }, []);

    // ===================== //
    // ===== SISTRA ===== //
    // ===================== //

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch all data in parallel
                const [
                    listaAgenteCausador,
                    listaHouveDispensa,
                    listaNaturezaAtividade,
                    listaTipoAcidente,
                    listaStatusFinal,
                    listaSituacaoGeradora,
                    listaParteDoCorpoAtingida,
                    listaDiadaSemana


                ] = await Promise.all([

                    utilService.obterAgenteCausadorAcidentes(),
                    utilService.obterHouveDispensas(),
                    utilService.obterNaturezaDaAtividades(),
                    utilService.obterTipoDeAcidentes(),
                    utilService.obterStatusFinals(),
                    utilService.obterSituacaoGeradoras(),
                    utilService.obterParteDoCorpoAtingidas(),
                    utilService.obterDiaDaSemanas(),


                ]);

                // Set all state values

                setAgenteCausadorAcidente(listaAgenteCausador.data);
                setHouveDispensa(listaHouveDispensa.data);
                setNaturezaDaAtividade(listaNaturezaAtividade.data);
                setTipoDeAcidente(listaTipoAcidente.data);
                setStatusFinal(listaStatusFinal.data);
                setSituacaoGeradora(listaSituacaoGeradora.data);
                setParteDoCorpoAtingida(listaParteDoCorpoAtingida.data);
                setDiaDaSemana(listaDiadaSemana.data);



            } catch (error) {
                console.error("Erro ao carregar dados:", error);
                toast.error("Erro ao carregar dados do sistema.");
            }
        };

        fetchAllData();
    }, []);

    // ===================== //
    // ===== Fim SISTRA ===== //
    // ===================== //

    useEffect(() => {
        if (!watchedUF || watchedUF.length !== 2) {
            // clear if UF is empty
            setValue('serinfra', '', { shouldDirty: true, shouldValidate: true });
            return;
        }

        let cancel = false;

        (async () => {
            try {
                const resp = await utilService.obterSerinfras(); // <-- returns ALL
                if (cancel) return;

                const lista = Array.isArray(resp?.data) ? resp.data : [];

                const match = lista.find(item => {
                    const area = item?.area_atuacao ?? item?.area_de_atuacao;
                    const ufs = parseAreaToUFs(area);
                    return ufs.includes(watchedUF);
                });

                const serinfraNome = match?.serinfra ?? '';

                setValue('serinfra', serinfraNome, {
                    shouldDirty: true,
                    shouldValidate: true
                });

                if (!serinfraNome) {
                    toast.warn(`Nenhuma SERINFRA encontrada para UF=${watchedUF}`);
                }

            } catch (err) {
                if (cancel) return;
                setValue('serinfra', '', { shouldDirty: true, shouldValidate: true });

                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Erro ao obter SERINFRA para o estado selecionado.';
                toast.error(msg);
            }
        })();

        return () => { cancel = true; };
    }, [watchedUF, setValue]);

    useEffect(() => {
        // precisa de data_ocorrencia + lista diadaSemana carregada
        if (!watchedDataOcorrencia) {
            // se apagar a data, apaga o dia também
            setValue('dia_da_semana', '', { shouldDirty: true, shouldValidate: true });
            return;
        }

        const weekdayLabel = weekdayPtBRFromISODate(watchedDataOcorrencia);
        if (!weekdayLabel) return;

        // tenta achar o item da lista (por descricao)
        const match = findDiaSemanaByLabel(diadaSemana, weekdayLabel);

        if (match?.codigo != null) {
            // salva o CÓDIGO (recomendado, porque é o que seu backend normalmente quer)
            setValue('dia_da_semana', String(match.codigo), {
                shouldDirty: true,
                shouldValidate: true
            });
        } else {
            // fallback: salva texto (se sua model aceitar string)
            // se não aceitar, você pode remover este else
            setValue('dia_da_semana', weekdayLabel, {
                shouldDirty: true,
                shouldValidate: true
            });
        }
    }, [watchedDataOcorrencia, diadaSemana, setValue]);

    return (
        <>
            <div className='formulario-titulo'>
                <h3>Formulário para numeração de {Modelo}</h3>
            </div>

            <div className='formulario-main'>

                <div className='formulario-content'>
                    <DirinfraInput
                        name='militar_acidentado'
                        erros={errors}
                        label={Dicionario('militar_acidentado')}
                        placeholder='Ex.: 7304013'
                        registro={register}
                        required={true}
                    />
                    <div className='linha'>
                        <DirinfraTextArea
                            name='local_ocorrencia'
                            erros={errors}
                            label='Local da Ocorrência'
                            placeholder='Descreva o local onde ocorreu o acidente.'
                            registro={register}
                            required={true}
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraSelect
                            label='Gravidade do Acidente'
                            name='gravidade_acidente'
                            registro={register}
                            required={true}
                            options={gravidadeAcidentes.map(ga =>
                                ({ value: String(ga.gravidade_acidente), label: ga.gravidade_acidente }))}
                            erros={errors}
                            placeholder='Selecione a gravidade do acidente'
                            setValue={setValue} //Obrigatório para o componente DirinfraListSelect
                            watch={watch}

                        />
                    </div>

                    <div className='linha'>
                        <DirinfraSelect
                            label='Estado'
                            name='estado_demanda'
                            registro={register}
                            required={true}
                            options={(estadosList || []).map(estado => ({ value: estado, label: estado }))}
                            erros={errors}
                            watch={watch}
                            placeholder='Sigla do Estado da Ocorrência'
                            value={watch('estado_demanda') ?? estadoSelecionado ?? ''}
                            onChange={(e) => {
                                const uf = normalizeUF(e.target.value);
                                setEstadoSelecionado(uf);
                                // If your DirinfraSelect doesn't propagate to RHF, keep this:
                                setValue('estado_demanda', uf, { shouldDirty: true, shouldValidate: true });
                            }}
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraInput
                            name='serinfra'
                            erros={errors}
                            label='SERINFRA'
                            placeholder='Preenchido ao selecionar o Estado'
                            registro={register}
                            required={false}
                            readOnly={true}
                            value={watch('serinfra') ?? ''}
                        />
                    </div>

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

                    <DirinfraSelect
                        label='Natureza da Atividade'
                        name='natureza_atividade'
                        registro={register}
                        required={true}
                        options={naturezaDaAtividade.map(na => ({
                            value: String(na.descricao),
                            label: na.descricao,
                        }))}
                        erros={errors}
                        placeholder='Selecione a Natureza da Atividade'
                        watch={watch}
                        setValue={setValue}
                        value={watch('natureza_atividade') ?? ''}

                    />

                    <DirinfraSelect
                        label='Dispensa ou Afastamento'
                        name='dispensa_afastamento'
                        registro={register}
                        required={true}
                        options={houveDispensa.map(da => ({
                            value: String(da.descricao),
                            label: da.descricao,
                        }))}
                        erros={errors}
                        placeholder='Selecione Dispensa ou Afastamento'
                        watch={watch}
                        setValue={setValue}
                        value={watch('dispensa_afastamento') ?? ''}
                    />

                    <div className='linha'>
                        <DirinfraTextArea
                            name='descricao_dispensa'
                            erros={errors}
                            label='Descrição da Dispensa'
                            placeholder='Descreva os detalhes da dispensa ou afastamento.'
                            registro={register}
                            required={!isDispensaDisabled}
                            disabled={isDispensaDisabled}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraInputNumerico
                            name='duracao_dispensa'
                            label='Duração Dispensa (dias)'
                            register={register}
                            errors={errors}
                            setValue={setValue}
                            watch={watch}
                            required={!isDispensaDisabled}
                            disabled={isDispensaDisabled}
                        />
                    </div>
                    <DirinfraSelect
                        label='Status Final'
                        name='status_final'
                        registro={register}
                        required={true}
                        options={statusFinal.map(sf => ({
                            value: String(sf.descricao),
                            label: sf.descricao,
                        }))}
                        erros={errors}
                        placeholder='Selecione o Status Final'
                        watch={watch}
                        setValue={setValue}
                        value={watch('status_final') ?? ''}
                    />

                    <DirinfraSelect
                        label='Tipo de Acidente'
                        name='descricao'
                        registro={register}
                        required={true}
                        options={tipoDeAcidente.map(ta => ({
                            value: String(ta.descricao),
                            label: String(ta.descricao),
                        }))}
                        erros={errors}
                        placeholder='Selecione o Tipo de Acidente'
                        watch={watch}
                        setValue={setValue}
                        value={watch('descricao') ?? ''}
                    />

                    <div className='linha'>
                        <DirinfraInput
                            name='data_ocorrencia'
                            erros={errors}
                            label={Dicionario('data_ocorrencia')}
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={true}
                            type='date'
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraInput
                            name='dia_da_semana'
                            erros={errors}
                            label='Dia da Semana'
                            placeholder='Preenchido a partir da Data'
                            registro={register}
                            required={false}
                            readOnly={true}
                            value={
                                // se dia_da_semana for codigo, mostra descricao; se for texto, mostra o próprio valor
                                getDiaSemanaLabelFromCodigo(diadaSemana, watchedDiaSemanaCodigo) ||
                                String(watchedDiaSemanaCodigo ?? '')
                            }
                        />
                    </div>

                    {/* Campo REAL que vai para o backend */}
                    <input type="hidden" {...register('dia_da_semana')} />

                    <div className='linha'>
                        <DirinfraInput
                            name='data_envio_form'
                            erros={errors}
                            label={Dicionario('data_envio_form')}
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={true}
                            type='date'
                            min={watch('data_ocorrencia') || undefined} // ✅ HTML5 validation
                            validar={{  // ✅ React Hook Form validation (already supported by DirinfraInput)
                                afterOrEqualStart: (value) => {
                                    const dataInicio = watch('data_ocorrencia');
                                    if (!value || !dataInicio) return true;
                                    return value >= dataInicio ||
                                        'A data de envio não pode ser anterior à data da ocorrência.';
                                }
                            }}
                        />
                    </div>
                    <PeriodoDeElaboracaoForm
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        dataInicioField='data_ocorrencia'
                        dataEntregaField='data_envio_form'
                    // periodoField uses default 'periodo_elaboracao'
                    // label uses default from Dicionario
                    />



                    {/* ====== Campos dissertativos ====== */}
                    <div className='linha'>
                        <DirinfraTextArea
                            name='descricao_gerais'
                            erros={errors}
                            label='Descrição Geral'
                            placeholder='Descreva detalhadamente o ocorrido.'
                            registro={register}
                            required={true}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraTextArea
                            name='causa_gerais'
                            erros={errors}
                            label='Causa Geral'
                            placeholder='Descreva as causas do ocorrido.'
                            registro={register}
                            required={true}
                        />
                    </div>




                    {/* ====================================== */}
                    {/* Estes campos apenas serão usados em 
                    em Forms de avaliação */}
                    {/* ====================================== */}

                    {/* <div className='linha'>
                        <DirinfraTextArea
                            name='recomendacoes_csmt'
                            erros={errors}
                            label='Recomendações CSMT'
                            placeholder='Informe as recomendações da Comissão de Segurança e Medicina do Trabalho.'
                            registro={register}
                            required={true}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraTextArea
                            name='recomendacoes_cipa'
                            erros={errors}
                            label='Recomendações CIPA'
                            placeholder='Informe as recomendações da Comissão Interna de Prevenção de Acidentes.'
                            registro={register}
                            required={true}
                        />
                    </div> */}
                    {/* ====================================== */}
                    {/* Fim de campos em Forms de avaliação */}
                    {/* ====================================== */}

                    {/* <div className='linha'>
                        <DirinfraTextArea
                            name='acoes_treinamentos'
                            erros={errors}
                            label='Ações e Treinamentos'
                            placeholder='Descreva as ações corretivas e treinamentos necessários.'
                            registro={register}
                            required={true}
                        />
                    </div> */}
                    <div className='linha'>
                        <DirinfraTextArea
                            name='obs_gerais'
                            erros={errors}
                            label='Observações'
                            placeholder='Digite aqui as informações relevantes que não foram destacadas nos campos anteriores.'
                            registro={register}
                        />
                    </div>
                    {/* <div className='linha'>
                        <DirinfraTextArea
                            name='obs_gerais'
                            erros={errors}
                            label='Observações'
                            placeholder='Digite aqui as informações relevantes que não foram destacadas nos campos anteriores.'
                            registro={register}
                            required={false}
                        />
                    </div> */}
                    {/* ====== Fim Campors dissertativos ====== */}

                </div>

                <div className='formulario-content'>
                    {data?.id_sistra ? (
                        <>
                            <p>Documento numerado como {Modelo} nº <em className='identificador'>{data.id_sistra}</em>
                                <ContentCopyIcon className={classes.iconeCopiar}
                                    onClick={() => copiarID(data.id_sistra)}
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

export default AcidenteForm;