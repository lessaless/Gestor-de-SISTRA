import React, { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from "react-router-dom";


import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';
import DirinfraTextarea from '../../DirinfraTextarea/DirinfraTextarea';
import DirinfraListSelect from '../../DirinfraSelect/DirinfraListSelect';


import demandaService from '../../../services/demandaService';
import utilService from '../../../services/utilService';
import { useSalvar } from '../../../utils/SalvarContext';

import {
    listarDados,
    onError,
    onSubmit,
    receberArquivo,
    redirecionar
} from '../../../utils/gerCrud';

const Modelo = "Código de Projeto";// Nome para o título no front

const CodigoProjForm = () => {

    const contexto = useFormContext();        // pode ser undefined
    const localForm = useForm();        // sempre chamado
    const metodo = contexto || localForm;
    const { onSaved, onDesvincular } = useSalvar() || {}; // pega função do pai
    const { register, handleSubmit, formState: { errors, isDirty }, reset, setValue, getValues, watch, setError, clearErrors } = metodo;
    const data = watch();
    const { id, id_demanda } = useParams();

    // console.log(`O valor de id_demanda e ${id_demanda}`)//se for para editar, pega id na url
    const pagina = id || data?._id ? 'Editar' : 'Criar';
    const colecao = 'codigoprojetos'; // Possui os Códigos BIM

    const [arquivo, setArquivo] = useState(null);
    const [arquivoAlterado, setArquivoAlterado] = useState(false);
    const [demandas, setDemandas] = useState([]);
    const [benfeitoriaBim, setBenfeitoriaBim] = useState([]);
    const [benfeitoriasBim, setBenfeitoriasBim] = useState([]);
    const [benfeitoriasBimEscolhida, setBenfeitoriaBimEscolhida] = useState([]);
    const [localidadeEscolhida, setLocalidadeEscolhida] = useState([]);
    const [faseDoProjetoEscolhida, setFaseDoProjetoEscolhida] = useState([]);
    const [estado, setEstado] = useState('UF');
    const [estados, setEstados] = useState([]);
    const [localidade, setLocalidade] = useState([]);
    const [localidades, setLocalidades] = useState([]);
    const [codigoBimGerado, setCodigoBimGerado] = useState('');
    const [faseDoProjeto, setFaseDoProjeto] = useState([]);
    const [fasesDoProjeto, setFasesDoProjeto] = useState([]);
    const currentId = watch('id_demanda')
    const [isLoading, setIsLoading] = useState(false);

    const [temErroArquivo, setTemErroArquivo] = useState(false);

    const [btnNovaDemanda, setBtnNovaDemanda] = useState(false);
    const atualizarIsDirty = (estado) => {// ATUALIZA EXIBIÇÃO DO BOTÃO SALVAR
        setArquivoAlterado(estado);
    };

    const arquivoId = watch("arquivo_id");  // observa o campo do form
    useEffect(() => {
        if (onDesvincular) {
            onDesvincular(() => {
                setValue("id_demanda", "_desvincular");
            });
        }
    }, [onDesvincular]);
    // console.log(`Valor de curentId: ${currentId}`)
    const demandaSelecionada = demandas.find(d =>
        d._id === currentId || d.id_demanda === currentId   // cobre _id OU código humano
    );
    // console.log('O valor de estado_demanda:', demandaSelecionada?.estado_demanda);
    const estadoDemanda = demandaSelecionada?.estado_demanda ?? '';
    // console.log(`O valor de estadoDemanda: ${estadoDemanda}`);
    useEffect(() => {
        if (!arquivoId) return;

        async function buscarArquivo() {
            try {
                const arquivoObj = await receberArquivo(arquivoId);
                setArquivo(arquivoObj);          // para GerenciadorDeArquivo
                // setValue("arquivo", arquivoObj); // opcional, se quiser manter no form state
            } catch (error) {
                console.error("Erro ao carregar arquivo:", error);
            }
        }

        buscarArquivo();
    }, [arquivoId]);


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

                //formatar as datas para o formulário string > Date > ISOString
                window.dataParaFormulario(resp[0]);
                if (resp[0].id_benfeitoria) setBenfeitoriaBimEscolhida(resp[0].id_benfeitoria);
                if (resp[0].estado_demanda) setEstado(resp[0].estado_demanda);
                if (resp[0].localidade_demanda) setLocalidadeEscolhida(resp[0].localidade_demanda);
                if (resp[0].fase_do_projeto) setFaseDoProjetoEscolhida(resp[0].fase_do_projeto)
                reset(resp[0]);

                if (resp[0].arquivo_id) {
                    const arquivoObj = await receberArquivo(resp[0].arquivo_id);
                    setArquivo(arquivoObj);
                };

                setIsLoading(false);

            } catch (error) {
                toast.error(error.message);

            }
        };

        if (!id || contexto) return;//Busca dados caso tenha recebido id no URL e não esteja 
        // em contexto de formulário (criado para evitar conflito com o useEffect do GCDemandas)
        buscarDado();
    }, [id]);

    //Buscar a próxima sequência numérica
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

    const aoEnviar = async (data) => {
        const listaChaves = Object.keys(data);
        data.colecao = colecao;
        data.arquivo = arquivo;

        if (data.id_demanda === "_desvincular") {
            data.id_demanda = null;
        } else if (!data.id_demanda && id_demanda) {
            data.id_demanda = id_demanda;
        }
        console.log("ID da demanda antes de salvar:", data.id_demanda);
        console.log("ID da demanda dos params:", id_demanda);
        const dSel = demandas.find(x => x._id === (data.id_demanda || currentId) || x.id_demanda === (data.id_demanda || currentId));
        console.log("Valor de dSel", dSel);
        data.estado_demanda = dSel?.estado_demanda ?? '';
        data.localidade_demanda = dSel?.localidade_demanda ?? '';
        data.benfeitoria = dSel?.benfeitoria_bim ?? '';
        const estado = data.estado_demanda;                 // now guaranteed from demandas
        const localidade = data.localidade_demanda ?? '';
        const benfeitoria = data.benfeitoria ?? '';
        console.log("Benfeitoria do codigo bim", benfeitoria);
        const fase_do_projeto = data.fase_do_projeto ?? '';
        // console.log("=== DEBUG INÍCIO ===");
        // console.log("Pagina:", pagina);
        // console.log("Estado:", estado);
        // console.log("Localidade:", localidade);
        // console.log("Benfeitoria:", benfeitoria);
        // console.log("Fase do Projeto:", fase_do_projeto);
        // console.log("Sequencia ANTES de gerar:", data.sequencia_numerica);
        try {
            //GERAR SEQUÊNCIA NUMÉRICA (apenas se for novo registro)
            if (!data.sequencia_numerica && (pagina === 'Editar' || pagina === 'Criar')) {
                // console.log("Entrando na geração de sequência...");
                // console.log("Buscando próxima sequência para:", { estado, localidade, benfeitoria });

                data.sequencia_numerica = await buscarProximaSequencia(estado, localidade, benfeitoria);

                // console.log("Sequência numérica gerada:", data.sequencia_numerica);
            } else {
                // console.log(" NÃO entrou na geração. Motivo: ");
                // console.log("  - data.sequencia_numerica existe?", !!data.sequencia_numerica);
                // console.log("  - pagina === 'Criar'?", pagina === 'Criar');
            }

            const sequencia = data.sequencia_numerica ?? '';

            // Gerar código BIM completo
            data.codigo_bim = `${estado}${localidade}-${benfeitoria}${fase_do_projeto}${sequencia}`;
            console.log("estado do codigo bim", estado);
            console.log("localidade do codigo bim", localidade);
            console.log("benfeitoria do codigo bim", benfeitoria);
            console.log("fase_do_projeto do codigo bim", fase_do_projeto);
            console.log("sequencia do codigo bim", sequencia);
            setCodigoBimGerado(data.codigo_bim);

            toast.info(`Código BIM: ${data.codigo_bim}`, {
                position: "top-right",
                autoClose: 10000,
            });
            // Limpar o alerta após 5 segundos
            setTimeout(() => setCodigoBimGerado(''), 10000);

            if (data?.autores?.length === 0) throw new Error("É necessário ter pelo menos um autor!");

            const resp = await onSubmit(data, pagina, listaChaves, Modelo);
            if (data.id_demanda && !resp.obj.id_demanda) {
                resp.obj.id_demanda = data.id_demanda;
            }
            console.log("Objeto corrigido:", resp.obj);
            console.log("   - id_demanda:", resp.obj.id_demanda);
            console.log("Documento salvo com id_demanda:", resp.obj.id_demanda);
            onSaved?.(data.id_demanda === "_desvincular" ? null : resp.obj);

            // toast.success(`Código BIM gerado: ${data.codigo_bim}`);
            console.log(`o valor de resp.obj.id_demanda ${resp.obj.id_demanda}`)


            // mensagem de sucesso inicial
            // toast.success(resp.message);

            window.dataParaFormulario(resp.obj);
            reset({ ...getValues(), ...resp.obj });//mantém os valores do formulário e atualiza com os que vierem

            if (window.opener) {
                window.opener.atualizarPagina();
                setTimeout(() => {
                    window.close();
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

    // useEffect para mapear a lista de demandas do banco
    useEffect(() => {
        const fetchDemandas = async () => {
            try {
                const listaDemandas = await demandaService.lerDemandas();
                //console.log("lista de demandas obtidas no useEffect da página CNForm", listaDemandas.data);

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
        const fetchBenfeitoriasBim = async () => {
            try {
                const resultado = await utilService.obterBenfeitoriasBim();

                const benfeitoriasBimObtidos = resultado.data.map(item => ({
                    label: `${item.titulo}`,
                    value: `${item.codigo}`
                }));
                // console.log(`valor de benfeitoriasBimObtidos é ${benfeitoriasBimObtidos}`)
                setBenfeitoriasBim(benfeitoriasBimObtidos);
            } catch (error) {
                console.error('Erro ao obter a lista das Benfeitorias Bim', error);
            }
        };

        fetchBenfeitoriasBim();
    }, []);

    useEffect(() => {
        //console.log("Mapear lista de Localidades")
        const fetchLocalidades = async () => {
            try {
                // const listaEstados = await utilService.obterEstados();
                const listaLocalidades = await utilService.obterLocalidades();
                // console.log(`Valor de listaLocalidades`, listaLocalidades)
                const localidadesObtidas = listaLocalidades.data.map(item => ({
                    label: `${item.OM_titulo}`,
                    value: `${item.codigo}`
                }));
                setLocalidades(localidadesObtidas);

            } catch (error) {
                toast.error("Erro ao carregar Localidades");
            }
        };

        fetchLocalidades();
    }, []);


    useEffect(() => {
        //console.log("Mapear lista de fases do projeto")
        const fetchFasesDoProjeto = async () => {
            try {
                // const listaEstados = await utilService.obterEstados();
                const listaFasesDoProjeto = await utilService.obterFasesDoProjeto();
                // console.log(`Valor de listaFasesDoProjeto`, listaFasesDoProjeto)
                const fasesDoProjetoObtidas = listaFasesDoProjeto.data.map(item => ({
                    label: `${item.titulo}`,
                    value: `${item.codigo}`
                }));
                setFasesDoProjeto(fasesDoProjetoObtidas);

            } catch (error) {
                toast.error("Erro ao carregar fases do projeto");
            }
        };

        fetchFasesDoProjeto();
    }, []);


    const aoSelecionarDemanda = (event) => {
        const escolha = event.target.value;
        const novaEscolha = escolha === 'Não se aplica';
        if (btnNovaDemanda !== novaEscolha) {
            setBtnNovaDemanda(novaEscolha);
        }
    }

    const aoSelecionarBenfeitoriaBim = (eventOrValue) => {

        const sel = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;

        // encontra o label e insere o value, se:listaJoo.data.map(item => ({
        // label: `${item.foo}`,
        // value: `${item.bar}`
        const benfeitoriaBim = benfeitoriasBim.find(o => o.value === sel)
            || benfeitoriasBim.find(o => o.label === sel);

        setBenfeitoriaBimEscolhida(benfeitoriaBim);

        // o que é submetido
        setValue('benfeitoria', benfeitoriaBim?.value || '');          // escreve value
        // mantém o select com
        setValue('apelido_benfeitoria', benfeitoriaBim?.label || '');
    };
    // const aoSelecionarLocalidade = (event) => {
    //     const escolha = event.target.value;
    //     const localidade = localidades.find(t => t.value === escolha);
    //     setLocalidadeEscolhida(localidade);
    //     console.log(`O valor de localidade é ${localidade}`)
    //     setValue('apelido_localidade', localidade?.value || '');
    // }

    const aoSelecionarLocalidade = (eventOrValue) => {

        const sel = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;

        // encontra o label e insere o value, se:listaJoo.data.map(item => ({
        // label: `${item.foo}`,
        // value: `${item.bar}`
        const localidade = localidades.find(o => o.value === sel)
            || localidades.find(o => o.label === sel);

        setLocalidadeEscolhida(localidade);

        // O que é submetido:
        setValue('localidade_demanda', localidade?.value || '');          // escreve value
        // mantém o select com
        setValue('apelido_localidade_demanda', localidade?.label || '');
    };

    const aoSelecionarFaseDoProjeto = (event) => {
        const escolha = event.target.value;

        // Finds the object { label, value }
        const fase = fasesDoProjeto.find(t => t.value === escolha || t.label === escolha);

        setFaseDoProjetoEscolhida(fase);

        // escreve o valor de value em "fase_do_projeto"
        setValue('fase_do_projeto', fase?.value || '');

        // (Optional) Save label as alias
        setValue('apelido_fase_do_projeto', fase?.label || '');
    };

    useEffect(() => {
        //console.log("Mapear lista estados")
        const fetchEstados = async () => {
            try {
                const listaEstados = await utilService.obterEstados();
                // const listaLocalidades = await utilService.obterLocalidades();
                setEstados(listaEstados.data);
                // setLocalidades(listaLocalidades.data);

            } catch (error) {
                toast.error("Erro ao carregar Estados");
            }
        };

        fetchEstados();
    }, []);


    return (
        <>
            <div className='formulario-titulo'>
                <h3> Formulário para {Modelo} </h3>
            </div>

            <div className='formulario-main'>
                <div className='formulario-content'>
                    {/* <div className='linha'>
                        <DirinfraSelect
                            label='UF'
                            name='estado_demanda'
                            registro={register}
                            required={true}
                            options={estados.map(estado => ({ value: estado, label: estado }))}
                            erros={errors}
                            watch={watch}
                            placeholder='Sigla do Estado'
                            onChange={(e) => setEstado(e.target.value)} // Atualiza o estado selecionado
                        />
                    </div> */}

                    {/* <input
                        type="hidden"
                        {...register('localidade_demanda')}
                    />

                    <div className='linha'>
                        <DirinfraListSelect
                            label='Localidade'
                            name='apelido_localidade_demanda'
                            registro={register}
                            placeholder='Localidade deste Projeto...'
                            erros={errors}
                            options={localidades}
                            onChange={aoSelecionarLocalidade}
                            required={true}
                            setValue={setValue} //Obrigatório para o componente DirinfraListSelect
                            watch={watch}
                        />
                    </div> */}


                    {/* <input
                        type="hidden"
                        {...register('benfeitoria')}
                    />
                    <div className='linha'>
                        <DirinfraListSelect
                            label='Tipo Benfeitoria Bim'
                            name='apelido_benfeitoria'
                            registro={register}
                            placeholder='Benfeitoria Bim deste Código...'
                            erros={errors}
                            options={benfeitoriasBim}
                            onChange={aoSelecionarBenfeitoriaBim}
                            required={true}
                            setValue={setValue} //Obrigatório para o componente DirinfraListSelect
                            watch={watch}
                        />
                    </div> */}

                    <input
                        type="hidden"
                        {...register('fase_do_projeto')}
                    />

                    <div className='linha'>
                        <DirinfraListSelect
                            label='Fase do Projeto'
                            name='apelido_fase_do_projeto'
                            registro={register}
                            placeholder='Fase deste Projeto...'
                            erros={errors}
                            options={fasesDoProjeto}
                            onChange={aoSelecionarFaseDoProjeto}
                            required={true}
                            setValue={setValue} //Obrigatório para o componente DirinfraListSelect
                            watch={watch}
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraInput
                            // orientacao="column"
                            name='data_doc'
                            erros={errors}
                            label='Data da Alteração'
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={false}
                            type='date'
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraTextarea
                            name='obs_prj'
                            erros={errors}
                            label='Observações'
                            placeholder='Digite aqui as informações relevantes sobre este Código BIM que não foram destacadas nos campos anteriores.'
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
                    <GerenciadorDeArquivo arquivo={arquivo} setArquivo={setArquivo} atualizarIsDirty={atualizarIsDirty} temErroArquivo={temErroArquivo} setTemErroArquivo={setTemErroArquivo} />
                </div>
            </div>
        </>
    );
};

export default CodigoProjForm;