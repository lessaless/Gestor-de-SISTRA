import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { makeStyles } from '@material-ui/core/styles';
import { useParams, useNavigate } from "react-router-dom";
import AutorForm from '../AutorForms';

import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';
import DirinfraTextArea from '../../DirinfraTextArea/DirinfraTextArea';
import DirinfraListSelect from '../../DirinfraSelect/DirinfraListSelect';
import DirinfraCopiaButton from '../../DirinfraCopiaButton/DirinfraCopiaButton';
import { DirinfraCopyButton as CopyBtn } from '../../DirinfraCopiaButton/DirinfraCopiaButton';
import DisciplinasForm from '../DisciplinasForm';
import PalavrasChaveForm from '../PalavrasChaveForm';
import demandaService from '../../../services/demandaService';
import SolucaoForm from '../SolucaoForm';

import utilService from '../../../services/utilService';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Dicionario from '../../../utils/Dicionario';

import { useForm, useFormContext } from 'react-hook-form';
import { useSalvar } from '../../../utils/SalvarContext';

import {
    listarDados,
    onError,
    onSubmit,
    receberArquivo,
    redirecionar
} from '../../../utils/gerCrud';

const Modelo = "Termo de Justificativas Técnicas Relevantes";
const TJForm = () => {

    const contexto = useFormContext();
    const localForm = useForm();
    const metodo = contexto || localForm;

    const { onSaved, onDesvincular } = useSalvar() || {};
    const { register, handleSubmit, formState: { errors, isDirty }, reset, control, setValue, getValues, watch, clearErrors } = metodo;
    const data = watch();
    const { id, id_demanda } = useParams();
    const navigate = useNavigate();
    const pagina = id || data?._id ? 'Editar' : 'Criar';
    const colecao = 'tjs';

    const [arquivo, setArquivo] = useState(null);
    const [arquivoAlterado, setArquivoAlterado] = useState(false);
    const [demandas, setDemandas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [codigosBim, setCodigosBim] = useState([]);
    const [codigoBim, setCodigoBim] = useState([]);
    const [listaCodigosBim, setListaCodigosBim] = useState([]);
    const [temErroArquivo, setTemErroArquivo] = useState(false);
    const [codigoBimEscolhido, setCodigoBimEscolhido] = useState([]);
    const [fasesDoProjeto, setFasesDoProjeto] = useState([]);
    const [codigoProjetoBimGerado, setCodigoProjetoBimGerado] = useState('');
    const [codigoDocumentoBimGerado, setCodigoDocumentoBimGerado] = useState('');
    const [btnNovaDemanda, setBtnNovaDemanda] = useState(false);
    const [disciplinasList, setDisciplinasList] = useState([]);

    const atualizarIsDirty = (estado) => {
        setArquivoAlterado(estado);
    };

    const arquivoId = watch("arquivo_id");

    useEffect(() => {
        if (!arquivoId) return;

        async function buscarArquivo() {
            try {
                const arquivoObj = await receberArquivo(arquivoId);
                setArquivo(arquivoObj);
            } catch (error) {
                console.error("Erro ao carregar arquivo:", error);
            }
        }

        buscarArquivo();
    }, [arquivoId]);

    const currentIdDemanda = data?.id_demanda || id_demanda;
    const demandaSelecionada = demandas.find(d =>
        d._id === currentIdDemanda || d.id_demanda === currentIdDemanda
    );
    const estadoDemanda = demandaSelecionada?.estado_demanda ?? '';
    console.log(`O valor de estadoDemanda: ${estadoDemanda}`);

    useEffect(() => {
        async function buscarDado() {
            setIsLoading(true);
            try {
                const dataReq = {
                    colecao,
                    "filtro": {
                        "_id": id
                    }
                }

                const resp = await listarDados(dataReq);

                if (resp && resp[0]) {
                    window.dataParaFormulario(resp[0]);
                    if (resp[0].codigo_bim) setCodigoBimEscolhido(resp[0].codigo_bim);

                    // Ensure select field values are strings
                    const dadosFormatados = {
                        ...resp[0],
                        fase_do_projeto: resp[0].fase_do_projeto ? String(resp[0].fase_do_projeto) : '',
                        disciplina_principal: resp[0].disciplina_principal ? String(resp[0].disciplina_principal) : ''
                    };

                    reset(dadosFormatados);

                    if (resp[0].arquivo_id) {
                        const arquivoObj = await receberArquivo(resp[0].arquivo_id);
                        setArquivo(arquivoObj);
                    };
                }

                setIsLoading(false);

            } catch (error) {
                toast.error(error.message);
            }
        };

        if (!id || contexto) return;
        buscarDado();
    }, [id]);


    const aoEnviar = async (data) => {
        data.colecao = colecao;
        data.arquivo = arquivo;

        if (data.id_demanda === "_desvincular") {
            data.id_demanda = null;
        } else if (!data.id_demanda && id_demanda) {
            data.id_demanda = id_demanda;
        }

        try {
            if (!arquivo) {
                setTemErroArquivo(true)
                throw new Error(`É necessário realizar upload de ${Modelo}`)
            }

            let listaChaves = Object.keys(data);
            const isCreate = pagina === 'Criar';

            console.log(`=== ${isCreate ? 'CRIANDO' : 'ATUALIZANDO'} DOCUMENTO ===`);
            console.log("Dados a enviar:", data);

            const resp = await onSubmit(data, pagina, listaChaves);

            console.log("Resposta do backend:", resp);

            if (!resp || !resp.obj) {
                toast.success(resp?.message || "Salvo com sucesso");
                return;
            }

            // Check if BIM codes were generated
            const hasBimCodes = resp.obj.codigo_projeto_bim || resp.obj.codigo_documento_bim;

            console.log(`BIM codes na resposta? ${hasBimCodes ? 'Sim' : 'Não'}`);

            // If CREATE and no BIM codes returned, fetch document again
            if (isCreate && !hasBimCodes && resp.obj._id) {
                console.log("⏳ Buscando documento novamente para obter códigos BIM...");

                try {
                    const fetchData = {
                        colecao,
                        "filtro": {
                            "_id": resp.obj._id
                        }
                    };

                    await new Promise(resolve => setTimeout(resolve, 500));

                    const fetchedDocs = await listarDados(fetchData);

                    if (fetchedDocs && fetchedDocs[0]) {
                        console.log("✅ Documento buscado com sucesso");
                        console.log("Códigos BIM encontrados:", {
                            codigo_projeto_bim: fetchedDocs[0].codigo_projeto_bim,
                            codigo_documento_bim: fetchedDocs[0].codigo_documento_bim
                        });

                        resp.obj = { ...resp.obj, ...fetchedDocs[0] };
                    } else {
                        console.warn("⚠️ Documento não encontrado na segunda busca");
                    }
                } catch (fetchError) {
                    console.error("❌ Erro ao buscar documento:", fetchError);
                }
            }

            // Format dates for form
            window.dataParaFormulario(resp.obj);

            // Handle fase_do_projeto
            let faseFinal = String(resp?.obj?.fase_do_projeto ?? data?.fase_do_projeto ?? '');
            console.log('🔍 DEBUG fase_do_projeto:', {
                'resp.obj.fase_do_projeto': resp?.obj?.fase_do_projeto,
                'data.fase_do_projeto': data?.fase_do_projeto,
                'faseFinal': faseFinal
            });

            // Handle disciplina_principal
            let disciplinaFinal = String(resp?.obj?.disciplina_principal ?? data?.disciplina_principal ?? '');
            console.log('🔍 DEBUG disciplina_principal:', {
                'resp.obj.disciplina_principal': resp?.obj?.disciplina_principal,
                'data.disciplina_principal': data?.disciplina_principal,
                'disciplinaFinal': disciplinaFinal
            });

            // Prepare data for reset
            const dadosParaReset = {
                ...getValues(),
                ...resp.obj,
                fase_do_projeto: faseFinal,
                disciplina_principal: disciplinaFinal
            };

            console.log("Resetando formulário com:", {
                codigo_projeto_bim: dadosParaReset.codigo_projeto_bim,
                codigo_documento_bim: dadosParaReset.codigo_documento_bim,
                fase_do_projeto: dadosParaReset.fase_do_projeto,
                disciplina_principal: dadosParaReset.disciplina_principal
            });

            // Reset form with new values
            reset(dadosParaReset, {
                keepDirty: false,
                keepErrors: false,
                keepIsSubmitted: false,
                keepTouched: false,
                keepIsValid: false,
                keepSubmitCount: false
            });

            // ✅ ADD THIS - Ensure select values are set correctly after reset
            setTimeout(() => {
                setValue('fase_do_projeto', faseFinal, {
                    shouldDirty: false,
                    shouldValidate: false
                });
                clearErrors('fase_do_projeto');

                setValue('disciplina_principal', disciplinaFinal, {
                    shouldDirty: false,
                    shouldValidate: false
                });
                clearErrors('disciplina_principal');
            }, 0);

            // Notify parent (GCDemandas) if in context mode
            if (contexto && onSaved) {
                console.log('=== Notifying GCDemandas ===');
                console.log('Calling onSaved with:', dadosParaReset);
                onSaved(dadosParaReset);
            }

            // Show success message
            toast.success(resp.message);

            // Show BIM codes toasts
            setTimeout(() => {
                const formValues = getValues();
                const codigoProjetoBim = formValues.codigo_projeto_bim || resp.obj.codigo_projeto_bim;
                const codigoDocumentoBim = formValues.codigo_documento_bim || resp.obj.codigo_documento_bim;

                console.log("Valores finais para toasts:", {
                    codigoProjetoBim,
                    codigoDocumentoBim
                });

                if (codigoProjetoBim) {
                    toast.info(`Código Projeto BIM gerado: ${codigoProjetoBim}`, {
                        position: "top-right",
                        autoClose: 10000,
                    });
                }

                if (codigoDocumentoBim) {
                    toast.info(`Código Documento BIM gerado: ${codigoDocumentoBim}`, {
                        position: "top-right",
                        autoClose: 10000,
                    });
                }

                if (!codigoProjetoBim && !codigoDocumentoBim && data.id_demanda) {
                    console.warn("⚠️ Códigos BIM não foram gerados");
                    toast.warning("Códigos BIM não foram gerados. Verifique se a demanda possui os dados necessários.", {
                        position: "top-right",
                        autoClose: 8000,
                    });
                }
            }, 150);

            if (window.opener) {
                window.opener.atualizarPagina();
                setTimeout(() => window.close(), 1500);
            }

        } catch (error) {
            toast.error(error.message);
        }
    };



    const aoErrar = (errorsForm) => {
        try {
            onError(errorsForm);
        } catch (error) {
            toast.error(error.message);
        }
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
        const fetchCodigosBim = async () => {
            try {
                const listaCodigosBim = await utilService.obterCodigosBim();
                const codigosBimObtidos = listaCodigosBim.data.map(item => ({
                    label: `${item.codigo_bim}`,
                    value: `${item.codigo_bim}`
                }));
                setCodigosBim(codigosBimObtidos);

            } catch (error) {
                toast.error("Erro ao carregar Códigos Bim");
            }
        };

        fetchCodigosBim();
    }, []);

    const aoSelecionarCodigoBim = (eventOrValue) => {
        const sel = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;

        const codigoBimSel = codigosBim.find(o => o.value === sel)
            || codigosBim.find(o => o.label === sel);

        setCodigoBimEscolhido(codigoBimSel);
        setValue('codigo_bim', codigoBimSel?.value || '');
    };

    useEffect(() => {
        const fetchFasesDoProjeto = async () => {
            try {
                const listaFasesDoProjeto = await utilService.obterFasesDoProjeto();
                setFasesDoProjeto(listaFasesDoProjeto.data);
                console.log("Valores de Fases do Projeto é ", listaFasesDoProjeto.data)

            } catch (error) {
                toast.error("Erro ao carregar Fases do Projeto");
            }
        };

        fetchFasesDoProjeto();
    }, []);

    useEffect(() => {
        const fetchDisciplinas = async () => {
            try {
                const listaDisciplinas = await utilService.obterDisciplinas();
                console.log("Valor de listaDisciplinas é", listaDisciplinas)
                setDisciplinasList(listaDisciplinas.data);
                console.log("Valores de Disciplinas:", listaDisciplinas.data);
            } catch (error) {
                toast.error("Erro ao carregar Disciplinas");
            }
        };

        fetchDisciplinas();
    }, []);

    // Watch BIM code values for display
    const codigoProjetoBimValue = watch('codigo_projeto_bim');
    const codigoDocumentoBimValue = watch('codigo_documento_bim');

    return (
        <>
            <div className='formulario-titulo'>
                <h3> Formulário: {Modelo} </h3>
            </div>

            <div className='formulario-main'>
                <div className='formulario-content'>

                    <div className='linha'>
                        <DirinfraInput
                            name='codigo_projeto_bim'
                            erros={errors}
                            label='Código Projeto BIM'
                            placeholder='Apenas se atrelado a demanda.'
                            registro={register}
                            required={false}
                            disabled={true}
                            addon={
                                <CopyBtn
                                    name='codigo_projeto_bim'
                                    label='Código Projeto BIM'
                                    // optional: pass inputProps.getValues if you want copy to use a provided getValues function:
                                    inputProps={{ getValues }}
                                    size={34}
                                />
                            }
                        />
                    </div>

                    <DirinfraSelect
                        label='Fase Do Projeto'
                        name='fase_do_projeto'
                        registro={register}
                        required={true}
                        options={fasesDoProjeto.map(fp => ({
                            value: String(fp.codigo),
                            label: fp.titulo,
                        }))}
                        erros={errors}
                        placeholder='Selecione a Fase do Documento'
                        watch={watch}
                        setValue={setValue}  // ✅ ADD THIS
                        value={String(watch('fase_do_projeto') ?? '')}  // ✅ ADD THIS
                    />

                    <DirinfraSelect
                        label='Disciplina Principal (para código BIM)'
                        name='disciplina_principal'
                        registro={register}
                        required={true}
                        options={disciplinasList.map(disc => ({
                            value: String(disc.codigo),
                            label: disc.titulo,
                        }))}
                        erros={errors}
                        placeholder='Selecione a Disciplina Principal'
                        watch={watch}
                        setValue={setValue}  // ✅ ADD THIS
                        value={String(watch('disciplina_principal') ?? '')}  // ✅ ADD THIS
                    />


                    <DisciplinasForm
                        register={register}
                        errors={errors}
                        control={control}
                        setValue={setValue}
                        watch={watch}
                    />

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
                        <DirinfraTextArea
                            name='obs_tj'
                            erros={errors}
                            label='Observações'
                            placeholder={`Digite aqui informações relevantes sobre este ${Modelo} que não foram destacadas nos campos anteriores.`}
                            registro={register}
                            required={false}
                            a={200}
                        />
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
                </div>

                <div className='formulario-content'>
                    <GerenciadorDeArquivo
                        arquivo={arquivo}
                        setArquivo={setArquivo}
                        atualizarIsDirty={atualizarIsDirty}
                        temErroArquivo={temErroArquivo}
                        setTemErroArquivo={setTemErroArquivo}
                    />
                </div>
            </div>
        </>
    );
};

export default TJForm;
