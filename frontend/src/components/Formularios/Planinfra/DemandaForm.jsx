import React, { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from "react-router-dom";

import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import arquivoService from '../../../services/arquivoService';

import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';
import DirinfraTextarea from '../../DirinfraTextarea/DirinfraTextarea';
import DirinfraListSelect from '../../DirinfraSelect/DirinfraListSelect';

import utilService from '../../../services/utilService';
import { useSalvar } from '../../../utils/SalvarContext';
import {
    listarDados,
    onError,
    onSubmit,
    receberArquivo,
    redirecionar
} from '../../../utils/gerCrud';
import demandaService from '../../../services/demandaService';


const MIN_CHARS_APELIDO = 5;
const MAX_CHARS_APELIDO = 20;

const msgsFatoOriginador = {
    'Documento SIGADAER': 'Faça upload do arquivo em PDF do documento SIGADAER.',
    'E-mail': 'Faça upload do arquivo em PDF ou imagem do E-mail contendo o corpo da mensagem, remetente e destinatário.',
    'Despacho Pessoal': 'Faça upload de qualquer arquivo em PDF ou imagem que seja relevante para registrar o Fato Originador.'
}

const DemandaForm = ({ modoVisualizacao = false }) => {
    const contexto = useFormContext();        // pode ser undefined
    const localForm = useForm();        // sempre chamado
    const metodo = contexto || localForm;
    const { onSaved, onDesvincular } = useSalvar() || {}; // pega função do pai
    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch, setValue, getValues, setError, clearErrors } = metodo;

    const data = watch();
    const { id } = useParams();//se for para editar, pega id na url
    const navigate = useNavigate();
    const pagina = id || data?._id ? 'Editar' : 'Criar';
    const colecao = 'demandas';


    const [localidade, setLocalidade] = useState([]);
    const [localidades, setLocalidades] = useState([]);


    const [oms, setOms] = useState([]);
    const [ods, setOds] = useState([]);
    const [estados, setEstados] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [localidadeEscolhida, setLocalidadeEscolhida] = useState([]);
    
    const [benfeitoriasBim, setBenfeitoriasBim] = useState([]);
    const [benfeitoriasBimEscolhida, setBenfeitoriaBimEscolhida] = useState([]);
    const [tipo, setTipo] = useState([]);
    const [terrenos, setTerrenos] = useState([]);
    const [terrenoEscolhido, setTerrenoEscolhido] = useState([]);
    const [benfeitorias, setBenfeitorias] = useState([]);
    const [benfeitoriaEscolhida, setBenfeitoriaEscolhida] = useState([]);
    const [fatoOriginador, setFatoOriginador] = useState([]);
    const [omEscolhida, setOmEscolhida] = useState('OM');
    const [municipioEscolhido, setMunicipioEscolhido] = useState('Cidade');
    const [apelidoEscolhido, setApelidoEscolhido] = useState('Epíteto');
    const [submitting, setSubmitting] = useState(false);
    // const [propriedadeFAB, setPropriedadeFAB] = useState('Sim');

    // Estado selecionado
    const [estado, setEstado] = useState('UF');
    // Verificar se a página está em modo visualização
    const isEditMode = modoVisualizacao || (pagina === 'Editar');
    // console.log("Valor de pagina é ", pagina)
    const [arquivo, setArquivo] = useState(null);
    const [arquivoAlterado, setArquivoAlterado] = useState(false);
    // Manipulador de erro apenas para o componente arquivo
    const [temErroArquivo, setTemErroArquivo] = useState(false);

    const atualizarIsDirty = (estado) => {// ATUALIZA EXIBIÇÃO DO BOTÃO SALVAR
        setArquivoAlterado(estado);
    };

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
                console.log("valor de pagina", pagina)
                const resp = await listarDados(data);
                console.log("Valor de resp", resp)

                //formatar as datas para o formulário string > Date > ISOString
                window.dataParaFormulario(resp[0]);
                reset(resp[0]);

                //Exibir no 'Nome Final da Demanda' os itens abaixo, quando existentes
                // if (resp[0].apelido_demanda) setApelidoEscolhido(resp[0].apelido_demanda);
                if (resp[0].om_objeto) setOmEscolhida(resp[0].om_objeto);
                if (resp[0].id_benfeitoria) setBenfeitoriaBimEscolhida(resp[0].id_benfeitoria);
                if (resp[0].localidade_demanda) setLocalidadeEscolhida(resp[0].localidade_demanda);
                if (resp[0].cidade_demanda) setMunicipioEscolhido(resp[0].cidade_demanda);
                if (resp[0].estado_demanda) setEstado(resp[0].estado_demanda);




                if (resp[0].arquivo_id) {
                    const arquivoObj = await receberArquivo(resp[0].arquivo_id);
                    setArquivo(arquivoObj);
                };

            } catch (error) {
                toast.error(error.message);

                // setTimeout(() => {//se o id for inválido...
                //     redirecionar('Listar');
                // }, 1500);

            }
        };

        if (!id || contexto) return;//Busca dados caso tenha recebido id no URL e não esteja em contexto de formulário (criado para evitar conflito com o useEffect do GCDemandas)
        buscarDado();
    }, [id]);

    const aoEnviar = async (form) => {
        if (submitting) return;           // evita duplo clique
        setSubmitting(true);
        // console.log("Valor de form é", ...form)
        // console.log("Valor de arquivo é",arquivo)
        // form vem sem arquivo_id
        form.colecao = colecao;
        form.arquivo = arquivo;
        const payload = { ...form, colecao };
        try {
            // Verificação se há arquivo nos casos em que é obrigatório
            if ((fatoOriginador === 'Documento SIGADAER' || fatoOriginador === 'E-mail') && !arquivo) {
                setTemErroArquivo(true)
                throw new Error("É necessário realizar upload para este tipo de Fato Originador de Demanda")
            }
            // const resp = await onSubmit(data, pagina, listaChaves);


            // === TRATAMENTO DO ARQUIVO ===
            // 1) Se veio de BD (edição), ele terá _id/id => reaproveite
            if (arquivo && (arquivo._id || arquivo.id)) {
                payload.arquivo_id = arquivo._id || arquivo.id;
                console.log("Valor de arquivo é ", arquivo)
                // 2) Se é novo (File/Blob), faça upload primeiro para obter arquivo_id
            } else if (arquivo) {
                const respUp = await arquivoService.carregarArquivo({ file: arquivo });
                if (!(respUp?.status === 201 && respUp?.data?.arquivo_id)) {
                    throw new Error("Erro ao enviar arquivo para o servidor!");
                }
                payload.arquivo_id = respUp.data.arquivo_id;
                console.log("Valor de payload.arquivo_id", payload.arquivo_id)
                console.log("Valor de arquivo é ", arquivo) // possuo o valor de arquivo
            }

            // Até aqui, possuo o payload.arquivo_id.
            // De fato, há necessidade de salvá-lo em criarDemanda.


            const resp = await demandaService.criarDemanda(payload)
            console.log("Valor de resp em DemandaForm é", resp)
            const status = typeof resp?.status === 'number' ? resp.status : (resp?.ok ? 201 : 200);
            const data = resp?.data ?? resp;
            const ok = typeof data?.ok === 'boolean' ? data.ok : true;
            const obj = data?.obj ?? data;

            if (!ok) throw new Error(data?.message || "Falha ao criar Demanda.");

            onSaved?.(obj?.id_demanda ? obj : null);
            window.dataParaFormulario(obj);
            reset({ ...getValues(), ...obj });

            if (status === 201 || status === 200) toast.success("Demanda criada com sucesso!");

            if (window.opener) {
                window.opener.atualizarPagina();
                setTimeout(() => window.close(), 1500);
            }

        } catch (error) {
            toast.error(error?.message || "Erro ao salvar Demanda.");
        } finally {
            setSubmitting(false);
        }
    };


    // // inside aoEnviar
    // const aoEnviar = async (data) => {
    //     const listaChaves = Object.keys(data);
    //     data.colecao = colecao;
    //     data.arquivo = arquivo;

    //     try {
    //         if ((fatoOriginador === 'Documento SIGADAER' || fatoOriginador === 'E-mail') && !arquivo) {
    //             setTemErroArquivo(true);
    //             throw new Error("É necessário realizar upload para este tipo de Fato Originador de Demanda");
    //         }
    //         console.log("O valor de pagina é ", pagina)
    //         const resp = await demandaService.criarDemanda(data)

    //             ? await demandaService.atualizarDemanda({ ...getValues() }) // must include id_demanda
    //             : await demandaService.criarDemanda(data);
    //         console.log("Valor de resp é", resp)
    //         console.log("Valor de !resp.obj", !resp.obj)
    //         // Extra guard (shouldn’t trigger with the service above, but safe):
    //         if (!resp || typeof resp.status !== 'number' || !resp.obj) {
    //             throw new Error('Resposta inválida do servidor.');
    //         }

    //         onSaved?.(resp.obj?.id_demanda ? resp.obj : null);

    //         // bring server copy (including id_demanda) into the form
    //         window.dataParaFormulario(resp.obj);
    //         reset({ ...getValues(), ...resp.obj });

    //         if (resp.status === 201 || resp.status === 200) {
    //             toast.success(pagina === 'Editar' ? "Demanda atualizada com sucesso!" : "Demanda criada com sucesso!");
    //         }

    //         if (window.opener) {
    //             window.opener.atualizarPagina();
    //             setTimeout(() => window.close(), 1500);
    //         }

    //     } catch (error) {
    //         // You’ll now see the *server* message from the service catch above
    //         toast.error(error.message);
    //         // Optional: log full Axios response for debugging during dev
    //         // console.error(error);
    //     }
    // };


    // // useEffect para mapear a lista de oms e ods do banco
    useEffect(() => {
        //console.log("Mapear lista oms")
        const fetchOms = async () => {
            try {
                const listaOMs = await utilService.obterOMs();
                const listaODS = await utilService.obterODS();
                const listaEstados = await utilService.obterEstados();
                setOms(listaOMs.data);
                setOds(listaODS.data);
                setEstados(listaEstados.data);

            } catch (error) {
                toast.error("Erro ao carregar OMs, ODS ou Estados");
            }
        };

        fetchOms();
    }, []);

    // useEffect para mapear a lista de oms e ods do banco
    useEffect(() => {
        const fetchMunicipios = async () => {
            try {
                if (estado) {
                    const listaMunicipios = await utilService.obterMunicipios({ estado });
                    setMunicipios(listaMunicipios.data);
                }
            } catch (error) {
                toast.error("Erro ao carregar os municípios");
            }
        };

        fetchMunicipios();
    }, [estado]);

    //useEffect para mapear a lista de terrenos do banco
    useEffect(() => {
        const fetchTerrenos = async () => {
            try {
                //console.log("Terrenos obtidos")
                const resultado = await utilService.obterTerrenos();
                //console.log("Terrenos obtidos", resultado.data)
                const terrenosObtidos = resultado.data.map(item => ({
                    label: `${item.NR_TOMBO}`,
                    value: `${item.NR_TOMBO}`,
                    endereco: `${item.endereco}`,
                }));
                setTerrenos(terrenosObtidos);
            } catch (error) {
                console.error('Erro ao obter a lista dos Terrenos', error);
            }
        };

        fetchTerrenos();
    }, []);

    //useEffect para mapear a lista de benfeitorias do banco
    useEffect(() => {
        const fetchBenfeitorias = async () => {
            try {
                const resultado = await utilService.obterBenfeitorias();
                const benfeitoriasObtidos = resultado.data.map(item => ({
                    label: `${item.id_benfeitoria}`,
                    value: `${item.id_benfeitoria}`,
                    apelido: `${item.apelido}`,
                }));
                setBenfeitorias(benfeitoriasObtidos);
            } catch (error) {
                console.error('Erro ao obter a lista das Benfeitorias', error);
            }
        };

        fetchBenfeitorias();
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


    const aoSelecionarBenfeitoriaBim = (eventOrValue) => {

        const sel = eventOrValue?.target ? eventOrValue.target.value : eventOrValue;

        // encontra o label e insere o value, se:listaJoo.data.map(item => ({
        // label: `${item.foo}`,
        // value: `${item.bar}`
        const benfeitoriaBim = benfeitoriasBim.find(o => o.value === sel)
            || benfeitoriasBim.find(o => o.label === sel);

        setBenfeitoriaBimEscolhida(benfeitoriaBim);

        // o que é submetido
        setValue('benfeitoria_bim', benfeitoriaBim?.value || '');          // escreve value
        console.log("Valor de benfeitoria_bim",  benfeitoriaBim?.value)
        // mantém o select com
        setValue('apelido_benfeitoria', benfeitoriaBim?.label || '');
    };

    const aoErrar = (errors) => {
        //console.log(errors)
        try {
            onError(errors);
        } catch (error) {
            toast.error(error.message);
        }
    }

    const aoSelecionarTipo = (event) => {
        const escolha = event.target.value;
        setTipo(escolha);
    }

    const aoSelecionarTerreno = (event) => {
        const escolha = event.target.value;
        const terreno = terrenos.find(t => t.value === escolha);
        setTerrenoEscolhido(terreno);
        setValue('endereco_terreno', terreno?.endereco || '');
    }

    const aoSelecionarBenfeitoria = (event) => {
        const escolha = event.target.value;
        const benfeitoria = benfeitorias.find(t => t.value === escolha);
        setBenfeitoriaEscolhida(benfeitoria);
        setValue('apelido_benfeitoria', benfeitoria?.apelido || '');
    }

    const handleBlur = async (event) => {
        const name = event.target.name;
        const value = event.target.value;

        if (value.length < MIN_CHARS_APELIDO) {
            setError(name, { type: "minLength", value: MIN_CHARS_APELIDO });

        } else if (value.length > MAX_CHARS_APELIDO) {
            setError(name, { type: "maxLength", value: MAX_CHARS_APELIDO });

        } else {
            if (errors[name]) {//?.type !== 'required' (pode ser necessário adicionar essa validação pra não limpar required, mas parece que funcionou assim)
                clearErrors(name);
            }
        }
    };

    useEffect(() => {
        aoErrar(errors);
        //monitora o erro do campo 'apelido_demanda', se monitorar só errors inteiro, não detecta mudanças do mesmo campo
    }, [errors['apelido_demanda']]);


    if (ods.length !== 0) {

        return (
            <>
               <div className='formulario-titulo'>
                    <h3>
                        Formulário: Demanda {isEditMode && <span style={{ color: 'orange' }}>(Modo Visualização)</span>}
                    </h3>
                </div>
                {isEditMode && (
                    <div className='formulario-titulo' style={{ padding: '10px 20px' }}>
                        <span style={{ color: 'orange', fontSize: '0.9rem' }}>
                            Para alterações neste Formulário, abra um chamado
                        </span>
                    </div>
                )}

                <div className='formulario-main'>

                    <div className='formulario-content'>
                        <div className='linha'>
                            <DirinfraInput
                                name='titulo_demanda'
                                erros={errors}
                                label='Título (Descrição)'
                                placeholder='Exemplo: Recuperação do telhado do Hangar de Aeronaves da BASP'
                                registro={register}
                                required={true}
                                disabled={isEditMode}
                            // l={580}
                            />
                        </div>
                        <div className='linha'>
                            <DirinfraInput
                                // orientacao="column"
                                name='apelido_demanda'
                                registro={register}
                                label='Epíteto (Nome Curto)'
                                erros={errors}
                                placeholder='Recuperação do Hangar da BASP'
                                required={true}
                                //onBlur={handleBlur}
                                // validar={(input) => {
                                //     console.log("Entrou na função validar", input);
                                //     return input === 'teste' || 'Validar dados';
                                // }}
                                // l={290}
                                disabled={isEditMode}
                                onBlur={(e) => handleBlur(e)}
                                onChange={(e) => {
                                    if (!isEditMode) {
                                        setApelidoEscolhido(e.target.value.trim());
                                        setValue('apelido_demanda', e.target.value.trim(), { shouldDirty: true });//para atualizar o estado dirty do formulário
                                    }
                                }}
                            />
                        </div>
                    
                        <div className='linha'>
                            <DirinfraSelect
                                label='Tipo da Demanda'
                                name='tipo'
                                registro={register}
                                required={true}
                                options={[
                                    "Nova Construção", "Benfeitoria Existente"
                                ]}
                                watch={watch}
                                erros={errors}
                                placeholder='Selecionar Nova Construção ou Reforma'
                                onChange={aoSelecionarTipo}
                                disabled={isEditMode}
                            />
                        </div>

                        <div className='linha'>
                            <DirinfraSelect
                                label="Propriedade da FAB?"
                                name='propriedadeFAB'
                                options={['Sim', 'Não']}
                                registro={register}
                                watch={watch}
                                disabled={isEditMode}
                            /* onChange={(e) => setPropriedadeFAB(e.target.value)} */
                            />
                        </div>

                        {tipo === 'Nova Construção' && (


                            <>
                                <div className='linha'>
                                    <DirinfraListSelect
                                        label="Terreno"
                                        //type="text"
                                        name='terreno'
                                        registro={register}
                                        placeholder='Selecione o terreno ao qual essa nova construção está associada'
                                        erros={errors}
                                        //list='datalistOpcoes'
                                        // opcoesDataList={terrenos}
                                        options={terrenos}
                                        onChange={aoSelecionarTerreno}
                                        required={true}
                                        setValue={setValue} //Obrigatório para o componente DirinfraListSelect
                                        watch={watch}
                                        disabled={isEditMode}
                                    />
                                </div>
                                <input
                                    type="hidden"
                                    {...register('benfeitoria_bim')}
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
                                        disabled={isEditMode}
                                    />
                                </div>
                                {terrenoEscolhido && (
                                    <div className='linha'>
                                        <DirinfraInput
                                            label='Endereço'
                                            name='endereco_terreno'
                                            registro={register}
                                            value={terrenoEscolhido.endereco}
                                            disabled
                                            erros={errors}
                                            required={false}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {tipo === 'Benfeitoria Existente' && (
                            <>

                                <input
                                    type="hidden"
                                    {...register('benfeitoria_bim')}
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
                                        disabled={isEditMode}
                                    />
                                </div>
                            </>
                        )}

                        <div className='linha'>
                            <DirinfraSelect
                                // orientacao="column"
                                name='ods_objeto'
                                erros={errors}
                                label='ODS do Objeto'
                                placeholder='ODS do Objeto'
                                registro={register}
                                required={true}
                                watch={watch}
                                options={ods.map(ods => ({ value: ods, label: ods }))}
                                disabled={isEditMode}
                            />
                        </div>
                        {/* <div className='linha'>
                            <DirinfraListSelect
                                label='OM do Objeto'
                                name='om_objeto'
                                registro={register}
                                required={true}
                                options={oms.map(om => ({ value: om, label: om }))}
                                erros={errors}
                                placeholder='OM do Objeto'
                                onChange={(e) => setOmEscolhida(e.target.value)}
                                setValue={setValue} //Obrigatório para o componente DirinfraListSelect
                                watch={watch}
                            />
                        </div> */}
                        <input
                            type="hidden"
                            {...register('localidade_demanda')}
                        />
                        <div className='linha'>
                            <DirinfraListSelect
                                label='OM Objeto'
                                name='apelido_localidade_demanda'
                                registro={register}
                                placeholder='Localidade deste Projeto...'
                                erros={errors}
                                options={localidades}
                                onChange={aoSelecionarLocalidade}
                                required={true}
                                setValue={setValue} //Obrigatório para o componente DirinfraListSelect
                                watch={watch}
                                disabled={isEditMode}
                            />
                        </div>
                        <div className='linha'>
                            <DirinfraListSelect
                                label='OM Solicitante'
                                name='om_solicitante'
                                registro={register}
                                required={true}
                                options={oms.map(om => ({ value: om, label: om }))}
                                erros={errors}
                                placeholder='OM da Demanda'
                                setValue={setValue} //Obrigatório para o componente DirinfraListSelect
                                watch={watch}
                                disabled={isEditMode}
                            />
                        </div>
                        <div className='linha'>
                            <DirinfraSelect
                                label='Originador da Demanda'
                                name='fato_originador'
                                registro={register}
                                required={true}
                                options={[
                                    "Documento SIGADAER", "E-mail", "Despacho Pessoal", "Outro"
                                ]}
                                watch={watch}
                                erros={errors}
                                placeholder='Documento ou fato que deu origem à demanda'
                                onChange={(e) => setFatoOriginador(e.target.value)}
                                disabled={isEditMode}
                            />
                        </div>

                        {fatoOriginador === 'Documento SIGADAER' && (
                            <>
                                <div className='linha'>
                                    <DirinfraInput
                                        // orientacao="column"
                                        name='doc_sigadaer'
                                        erros={errors}
                                        label='Documento SIGADAER originador da Demanda'
                                        placeholder='Ofício nºXXX/YYYYY/ZZZZ'
                                        registro={register}
                                        required={fatoOriginador === 'Documento SIGADAER'}
                                        disabled={isEditMode}
                                    />
                                </div>
                                <div className='linha'>
                                    <DirinfraInput
                                        // orientacao="column"
                                        name='data_fato_originador'
                                        erros={errors}
                                        label='Data do documento SIGADER'
                                        placeholder='DD/MM/AAAA'
                                        registro={register}
                                        required={true}
                                        type='date'
                                        disabled={isEditMode}
                                    />
                                </div>
                            </>
                        )}

                        {fatoOriginador === 'E-mail' && (
                            <>
                                <div className='linha'>
                                    <DirinfraInput
                                        // orientacao="column"
                                        name='data_fato_originador'
                                        erros={errors}
                                        label='Data do E-mail'
                                        placeholder='DD/MM/AAAA'
                                        registro={register}
                                        required={true}
                                        type='date'
                                        disabled={isEditMode}
                                    />
                                </div>
                            </>
                        )}

                        {fatoOriginador === 'Despacho Pessoal' && (
                            <>
                                <div className='linha'>
                                    <DirinfraTextarea
                                        // orientacao="column"
                                        name='detalhes_despacho'
                                        erros={errors}
                                        label='Detalhes do Despacho'
                                        placeholder='Digite aqui, de forma resumida, os detalhes da solicitação, contendo identificação do solicitante e motivo.'
                                        registro={register}
                                        required={fatoOriginador === 'Despacho Pessoal'}
                                        a={200}
                                        disabled={isEditMode}
                                    />
                                </div>
                            </>
                        )}

                        {fatoOriginador === 'Outro' && (
                            <>
                                <div className='linha'>
                                    <DirinfraTextarea
                                        // orientacao="column"
                                        name='outro_fato_originador'
                                        erros={errors}
                                        label='Especifique'
                                        placeholder='Digite aqui, de forma resumida, como se deu a origem da demanda'
                                        registro={register}
                                        required={fatoOriginador === 'Outro'}
                                        a={200}
                                        disabled={isEditMode}
                                    />
                                </div>
                            </>
                        )}

                        <div className='linha'>
                            <DirinfraSelect
                                label='Estado'
                                name='estado_demanda'
                                registro={register}
                                required={true}
                                options={estados.map(estado => ({ value: estado, label: estado }))}
                                erros={errors}
                                watch={watch}
                                placeholder='Sigla do Estado'
                                onChange={(e) => setEstado(e.target.value)} // Atualiza o estado selecionado
                                disabled={isEditMode}
                            />
                        </div>
                        <div className='linha'>
                            <DirinfraListSelect
                                label='Cidade'
                                name='cidade_demanda'
                                registro={register}
                                required={true}
                                options={municipios.map(municipio => ({ value: municipio, label: municipio }))}
                                erros={errors}
                                placeholder='Nome da cidade'
                                onChange={(e) => setMunicipioEscolhido(e.target.value)}
                                setValue={setValue} //Obrigatório para o componente DirinfraListSelect
                                watch={watch}
                                disabled={isEditMode}
                            />
                        </div>
                        {/* // Add this hidden field once so id_demanda is tracked on Edit: */}
                        {/* <input type="hidden" {...register('id_demanda')} /> */}

                        <div className='linha'>
                            <DirinfraTextarea
                                // orientacao="column"
                                name='obs_demanda'
                                erros={errors}
                                label='Observações'
                                placeholder='Digite aqui as informações relevantes sobre essa demanda que não foram destacadas nos campos anteriores.'
                                registro={register}
                                required={false}
                                a={200}
                                disabled={isEditMode}
                            />
                        </div>

                        <div className='linha'>
                            <button
                                className='btn'
                                type="submit"
                                disabled={submitting || (!isDirty && !arquivoAlterado && !contexto) || isEditMode}
                                onClick={() => handleSubmit(aoEnviar, aoErrar)()}
                            >
                                {submitting ? "Salvando..." : isEditMode ? "Modo Visualização" : "Salvar"}

                            </button>
                        </div>
                    </div>

                    <div className='formulario-content'>
                        <GerenciadorDeArquivo arquivo={arquivo} setArquivo={setArquivo}
                            atualizarIsDirty={atualizarIsDirty} temErroArquivo={temErroArquivo}
                            setTemErroArquivo={setTemErroArquivo} disabled={isEditMode} />
                        {fatoOriginador && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {msgsFatoOriginador[fatoOriginador]}
                            </div>
                        )}
                    </div>

                </div>
            </>
        );


    } else return (
        <div>
            Nenhum ODS. <br />
            <a href="/main/help/faleconosco">Entre em contato</a> com o Administrador do Sistema.
        </div>
    )
};

export default DemandaForm;