import React, { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from "react-router-dom";


import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';
import DirinfraTextArea from '../../DirinfraTextArea/DirinfraTextArea';
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


const TAPForm = () => {

    const contexto = useFormContext();        // pode ser undefined
    const localForm = useForm();        // sempre chamado
    const metodo = contexto || localForm;
    const { onSaved, onDesvincular } = useSalvar() || {}; // pega função do pai

    const { register, handleSubmit, formState: { errors, isDirty }, reset, setValue, watch } = metodo;
    const data = watch();
    const { id, id_demanda } = useParams();
    const navigate = useNavigate();
    const pagina = id || data?._id ? 'Editar' : 'Criar';
    const colecao = 'taps';
    const currentId = watch('id_demanda')
    const [arquivo, setArquivo] = useState(null);
    const [arquivoAlterado, setArquivoAlterado] = useState(false);
    const [demandas, setDemandas] = useState([]);
    const [planinfras, setPlaninfras] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [codigosBim, setCodigosBim] = useState([]);
    const [codigoBim, setCodigoBim] = useState([]);
    const [codigoProjetoBimGerado, setCodigoProjetoBimGerado] = useState('');
    const [listaCodigosBim, setListaCodigosBim] = useState([]);
    const [temErroArquivo, setTemErroArquivo] = useState(false);
    const [codigoBimEscolhido, setCodigoBimEscolhido] = useState([]);
    const [demandaOpts, setDemandaOpts] = useState([]);      // [{label, value}]
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
    const estado = demandaSelecionada?.estado_demanda ?? '';
    // console.log('O valor de estado_demanda:', demandaSelecionada?.estado_demanda);


    const planinfraSelecionada = planinfras.find(d =>
        d._id === currentId || d.id_demanda === currentId   // cobre _id OU código humano
    );
    console.log('O valor de planinfraSelecionada:', planinfraSelecionada);

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
                console.log(`O valor de resp deste form é ${resp}`)
                //formatar as datas para o formulário string > Date > ISOString
                window.dataParaFormulario(resp[0]);
                console.log(`Valor de resp é ${resp[0].codigo_bim}`)
                if (resp[0].codigo_bim) setCodigoBimEscolhido(resp[0].codigo_bim);

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

        if (!id || contexto) return;//Busca dados caso tenha recebido id no URL e não esteja em contexto de formulário (criado para evitar conflito com o useEffect do GCDemandas)
        buscarDado();
    }, [id]);

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

        console.log(`o valor de id_demanda é ${data.id_demanda}`)
        const dSel = demandas.find(x => x._id === (data.id_demanda || currentId) || x.id_demanda === (data.id_demanda || currentId));
        const estado = dSel?.estado_demanda ?? '';
        console.log("O valor de estado_demanda é", estado)
        const cidade = dSel?.cidade_demanda ?? '';
        console.log("O valor de cidade_demanda é", cidade)
        const localidade = dSel?.localidade_demanda ?? '';
        console.log("O valor de localidade_demanda é", localidade)
        const benfeitoria = dSel?.benfeitoria_bim ?? '';
        console.log("O valor de benfeitoria é", benfeitoria)
        // Valores que com certeza vem de demandas
        data.estado_demanda = estado
        data.cidade_demanda = cidade
        data.localidade_demanda = localidade

        const dPlaninfra = planinfras.find(x => x._id === (data.id_demanda || currentId) || x.id_demanda === (data.id_demanda || currentId));
        console.log("O valor de dPlaninfra é", dPlaninfra)
        const codigoBimPlaninfra = dPlaninfra?.codigo_bim_planinfra ?? '';
        const faseDoProjeto = "PE"

        try {
            //GERAR SEQUÊNCIA NUMÉRICA (apenas se for novo registro)
            if (!data.sequencia_numerica && (pagina === 'Editar' || pagina === 'Criar')) {
                data.sequencia_numerica = await buscarProximaSequencia(estado, localidade, benfeitoria);
            }

            const sequencia = data.sequencia_numerica ?? '';
            data.codigo_projeto_bim = `${codigoBimPlaninfra}${faseDoProjeto}${sequencia}`;
            setCodigoProjetoBimGerado(data.codigo_projeto_bim);
            console.log("Valor de codigo_projeto_bim gerado é ", data.codigo_projeto_bim)
            // Salvando codigo_projeto_bim na colecao codigoprojetos 
            if (data.sequencia_numerica && data.codigo_projeto_bim) {
                await onSubmit({
                    colecao: 'codigoprojetos',
                    estado_demanda: estado,
                    localidade_demanda: localidade,
                    benfeitoria: benfeitoria,
                    sequencia_numerica: data.sequencia_numerica,
                    codigo_projeto_bim: data.codigo_projeto_bim
                }, pagina, ['estado_demanda', 'localidade_demanda', 'benfeitoria', 'sequencia_numerica', 'codigo_projeto_bim']);
            }

            // Verificação se há arquivo nos casos em que é obrigatório
            if (!arquivo) {
                setTemErroArquivo(true)
                throw new Error("É necessário realizar upload do TAP")
            }

            // This saves to 'taps' collection (your original save)
            const resp = await onSubmit(data, pagina, listaChaves);
            toast.success(resp.message);
            onSaved?.(data.id_demanda === "_desvincular" ? null : resp.obj);

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

    useEffect(() => {
        const fetchPlaninfras = async () => {
            try {
                const listaPlaninfras = await utilService.obterPlaninfras();
                console.log("lista de Planinfras obtida", listaPlaninfras.data);
                // console.log("lista de estado_demanda obtida", listaDemandas.data[0]?.estado_demanda);

                // const opcaoNovaDemanda = [
                //     { apelido_demanda: '', id_demanda: 'Não se aplica' },
                //     ...listaDemandas.data
                // ];

                // setDemandas(opcaoNovaDemanda);
                setPlaninfras(listaPlaninfras.data)
            } catch (error) {
                toast.error("Erro ao carregar a lista de planinfras");
            }
        };
        fetchPlaninfras();
    }, []);

    // useEffect para mapear a lista de demandas do banco 
    useEffect(() => {
        const fetchDemandas = async () => {
            try {
                const listaDemandas = await demandaService.lerDemandas();
                console.log("lista de demandas obtida", listaDemandas.data);
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


    const aoSelecionarDemanda = (event) => {
        const escolha = event.target.value;
        const novaEscolha = escolha === 'Não se aplica';
        if (btnNovaDemanda !== novaEscolha) {
            setBtnNovaDemanda(novaEscolha);
        }
    }

    useEffect(() => {
        //console.log("Mapear lista codigosbim")
        const fetchCodigosBim = async () => {
            try {

                const listaCodigosBim = await utilService.obterCodigosBim();
                // console.log(`Valor de listaCodigosBim.data é `, listaCodigosBim)
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

        // encontra o label e insere o value, se:listaJoo.data.map(item => ({
        // label: `${item.foo}`,
        // value: `${item.bar}`
        const codigoBim = codigosBim.find(o => o.value === sel)
            || codigosBim.find(o => o.label === sel);

        setCodigoBimEscolhido(codigoBim);

        // o que é enviado:
        setValue('codigo_bim', codigoBim?.value || '');          // escreve value
        // mantém o select com
        // setValue('apelido_localidade_demanda', localidade?.label || '');
    };


    return (
        <>
            <div className='formulario-titulo'>
                <h3> Formulário: Termo de Aprovação de Projeto </h3>
            </div>

            <div className='formulario-main'>
                <div className='formulario-content'>

                    <div className='linha'>
                        <DirinfraInput
                            name='estimativa_de_custo'
                            erros={errors}
                            label='Estimativa de Custo do TAP'
                            placeholder='Insira Estimativa de Custo aqui...'
                            registro={register}
                            required={true}
                            onChange={(e) => {
                                const raw = e.target.value;

                                // Mantém apenas dígitos
                                const onlyDigits = raw.replace(/\D/g, '');

                                // Se estiver vazio, apenas limpa o campo
                                if (!onlyDigits) {
                                    setValue('estimativa_de_custo', '');
                                    return;
                                }

                                // Converte e formata
                                const floatVal = (parseInt(onlyDigits, 10) / 100).toFixed(2);
                                const formatted = `R$ ${floatVal
                                    .replace('.', ',')
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;

                                setValue('estimativa_de_custo', formatted);
                            }}
                            value={watch('estimativa_de_custo')}
                        />

                    </div>


                    {/* <div className='linha'>
                        <DirinfraListSelect
                            label='Código BIM'
                            name='codigo_bim'
                            registro={register}
                            placeholder='ID BIM deste Projeto...'
                            erros={errors}
                            options={codigosBim}
                            onChange={aoSelecionarCodigoBim}
                            required={false}
                            setValue={setValue} //Obrigatório para o componente DirinfraListSelect
                            watch={watch}
                        />
                    </div> */}


                    <div className='linha'>
                        <DirinfraInput
                            // orientacao="column"
                            name='data_doc'
                            erros={errors}
                            label='Data do TAP'
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={false}
                            type='date'
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraInput
                            // orientacao="column"
                            name='doc_sigadaer'
                            erros={errors}
                            label='Documento SIGADAER do TAP'
                            placeholder='Ofício nºXXX/YYYYY/ZZZZ'
                            registro={register}
                            required={false}
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraInput
                            // orientacao="column"
                            name='data_doc_sigadaer'
                            erros={errors}
                            label='Data do Ofício SIGADAER'
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={false}
                            type='date'
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraTextArea
                            name='obs_tap'
                            erros={errors}
                            label='Observações'
                            placeholder='Digite aqui as informações relevantes sobre esse Termo de Abertura de Projeto que não foram destacadas nos campos anteriores.'
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
                    <GerenciadorDeArquivo arquivo={arquivo} setArquivo={setArquivo}
                        atualizarIsDirty={atualizarIsDirty} temErroArquivo={temErroArquivo}
                        setTemErroArquivo={setTemErroArquivo} />
                </div>
            </div>
        </>
    );
};

export default TAPForm;