import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { listarDados, onError, onSubmit, receberArquivo } from '../../../utils/gerCrud';
import utilService from '../../../services/utilService';
import demandaService from '../../../services/demandaService';

/**
 * Custom hook for common PEI form logic
 * @param {Object} params
 * @param {string} params.colecao - Collection name
 * @param {string} params.Modelo - Model name for display (e.g., 'Nota de Serviço')
 * @param {Object} params.methods - React Hook Form methods (watch, setValue, reset, getValues, etc.)
 * @param {Function} params.onSaved - Callback when form is saved (from SalvarProvider)
 * @param {boolean} params.requiresFile - Whether file upload is required (default: false)
 */
export const usePEIForm = ({ 
    colecao, 
    Modelo, 
    methods,
    onSaved,
    contexto = null,
    requiresFile = false 
}) => {
    const { register, handleSubmit, formState: { errors, isDirty }, reset, control, setValue, getValues, watch, clearErrors } = methods;
    const data = watch();
    // const data = watch('_id'); // inserir '_id' dentro de watch 
    // significa que o formulário ficará 'travado', sem a possibilidade de edição.
    // útil para outras ocasiões... 
    const { id, id_demanda } = useParams();
    const pagina = id || data?._id ? 'Editar' : 'Criar';

    // Common state
    const [arquivo, setArquivo] = useState(null);
    const [arquivoAlterado, setArquivoAlterado] = useState(false);
    const [demandas, setDemandas] = useState([]);
    const [fasesDoProjeto, setFasesDoProjeto] = useState([]);
    const [disciplinasList, setDisciplinasList] = useState([]);
    const [temErroArquivo, setTemErroArquivo] = useState(false);
    const [isLoadingPeca, setIsLoadingPeca] = useState(false);

    const atualizarIsDirty = (estado) => {
        setArquivoAlterado(estado);
    };

    // Watch arquivo_id and load file when it changes
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

    // Load document data if ID is in URL
    useEffect(() => {
        async function buscarDado() {
            if (!id || contexto) return;

            try {
                setIsLoadingPeca(true);
                const dataReq = {
                    colecao,
                    "filtro": { "_id": id }
                };

                const resp = await listarDados(dataReq);

                if (resp && resp[0]) {
                    window.dataParaFormulario(resp[0]);

                    // Normalize select fields
                    if (resp[0]?.fase_do_projeto) {
                        resp[0].fase_do_projeto = String(resp[0].fase_do_projeto);
                    }
                    if (resp[0]?.disciplina_principal) {
                        resp[0].disciplina_principal = String(resp[0].disciplina_principal);
                    }

                    reset(resp[0]);

                    // Ensure select values are set after reset
                    setTimeout(() => {
                        if (resp[0]?.fase_do_projeto) {
                            setValue('fase_do_projeto', String(resp[0].fase_do_projeto), {
                                shouldDirty: false,
                                shouldValidate: false
                            });
                        }
                        if (resp[0]?.disciplina_principal) {
                            setValue('disciplina_principal', String(resp[0].disciplina_principal), {
                                shouldDirty: false,
                                shouldValidate: false
                            });
                        }
                    }, 0);
                }

                setIsLoadingPeca(false);
            } catch (error) {
                toast.error(error.message);
                setIsLoadingPeca(false);
            }
        }

        buscarDado();
    }, [id, colecao, contexto, reset, setValue]);

    // Fetch demandas
    useEffect(() => {
        const fetchDemandas = async () => {
            try {
                const listaDemandas = await demandaService.lerDemandas();
                setDemandas(listaDemandas.data);
            } catch (error) {
                toast.error("Erro ao carregar a lista de demandas");
            }
        };
        fetchDemandas();
    }, []);

    // Fetch fases do projeto
    useEffect(() => {
        const fetchFasesDoProjeto = async () => {
            try {
                const listaFasesDoProjeto = await utilService.obterFasesDoProjeto();
                setFasesDoProjeto(listaFasesDoProjeto.data);
            } catch (error) {
                toast.error("Erro ao carregar Fases do Projeto");
            }
        };
        fetchFasesDoProjeto();
    }, []);

    // Fetch disciplinas
    useEffect(() => {
        const fetchDisciplinas = async () => {
            try {
                const listaDisciplinas = await utilService.obterDisciplinas();
                setDisciplinasList(listaDisciplinas.data);
            } catch (error) {
                toast.error("Erro ao carregar Disciplinas");
            }
        };
        fetchDisciplinas();
    }, []);

    // Submit handler
    const aoEnviar = async (data) => {
        data.colecao = colecao;
        data.arquivo = arquivo;

        // Handle id_demanda
        if (data.id_demanda === "_desvincular") {
            data.id_demanda = null;
        } else if (!data.id_demanda && id_demanda) {
            data.id_demanda = id_demanda;
        }

        try {
            // Validate file if required
            if (requiresFile && !arquivo) {
                setTemErroArquivo(true);
                throw new Error(`É necessário realizar upload de ${Modelo}`);
            }

            // Validate authors
            if (!data.disciplinasAutores || data.disciplinasAutores.length === 0) {
                throw new Error("É necessário ter pelo menos um autor!");
            }

            const autoresInvalidos = data.disciplinasAutores.filter(
                autor => !autor.nome_militar || autor.nome_militar.trim().length === 0
            );

            if (autoresInvalidos.length > 0) {
                throw new Error("Todos os autores devem ter uma pessoa selecionada!");
            }

            const listaChaves = Object.keys(data);
            const isCreate = pagina === 'Criar';

            const resp = await onSubmit(data, pagina, listaChaves);

            if (!resp || !resp.obj) {
                toast.success(resp?.message || "Salvo com sucesso");
                return;
            }

            // Check if BIM codes were generated
            const hasBimCodes = resp.obj.codigo_projeto_bim || resp.obj.codigo_documento_bim;

            // If CREATE and no BIM codes returned, fetch document again
            if (isCreate && !hasBimCodes && resp.obj._id) {
                try {
                    const fetchData = {
                        colecao,
                        "filtro": { "_id": resp.obj._id }
                    };

                    await new Promise(resolve => setTimeout(resolve, 500));
                    const fetchedDocs = await listarDados(fetchData);

                    if (fetchedDocs && fetchedDocs[0]) {
                        resp.obj = { ...resp.obj, ...fetchedDocs[0] };
                    }
                } catch (fetchError) {
                    console.error("Erro ao buscar documento:", fetchError);
                }
            }

            // Format dates for form
            window.dataParaFormulario(resp.obj);

            // Handle fase_do_projeto and disciplina_principal
            let faseFinal = String(resp?.obj?.fase_do_projeto ?? data?.fase_do_projeto ?? '');
            let disciplinaFinal = String(resp?.obj?.disciplina_principal ?? data?.disciplina_principal ?? '');

            // Prepare data for reset
            const dadosParaReset = {
                ...getValues(),
                ...resp.obj,
                id_demanda: resp.obj.id_demanda || data.id_demanda,
                fase_do_projeto: faseFinal,
                disciplina_principal: disciplinaFinal
            };

            // Reset form
            reset(dadosParaReset, {
                keepDirty: false,
                keepErrors: false,
                keepIsSubmitted: false,
                keepTouched: false,
                keepIsValid: false,
                keepSubmitCount: false
            });

            // Ensure select values are set after reset
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
                onSaved({
                    ...dadosParaReset,
                    id_demanda: dadosParaReset.id_demanda || id_demanda
                });
            }

            // Show success message
            toast.success(resp.message);

            // Show BIM codes toasts
            setTimeout(() => {
                const formValues = getValues();
                const codigoProjetoBim = formValues.codigo_projeto_bim || resp.obj.codigo_projeto_bim;
                const codigoDocumentoBim = formValues.codigo_documento_bim || resp.obj.codigo_documento_bim;

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

    // Error handler
    const aoErrar = (errorsForm) => {
        try {
            onError(errorsForm);
        } catch (error) {
            toast.error(error.message);
        }
    };

    return {
        // State
        arquivo,
        setArquivo,
        arquivoAlterado,
        atualizarIsDirty,
        demandas,
        fasesDoProjeto,
        disciplinasList,
        temErroArquivo,
        setTemErroArquivo,
        isLoadingPeca,
        
        // Form state
        data,
        isDirty,
        pagina,
        
        // Handlers
        aoEnviar,
        aoErrar,
        handleSubmit,
    };
};