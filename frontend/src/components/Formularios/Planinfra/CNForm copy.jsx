import React, { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from "react-router-dom";


import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';
import DirinfraTextArea from '../../DirinfraTextArea/DirinfraTextArea';

import demandaService from '../../../services/demandaService';

import {
    listarDados,
    onError,
    onSubmit,
    receberArquivo,
    redirecionar
} from '../../../utils/gerCrud';


const CNForm = () => {

    const contexto = useFormContext();        // pode ser undefined
    const localForm = useForm();        // sempre chamado
    const metodo = contexto || localForm;

    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = metodo;

    const { id } = useParams();//se for para editar, pega id na url
    const navigate = useNavigate();
    const pagina = id ? 'Editar' : 'Criar';
    const colecao = 'cns';

    const [arquivo, setArquivo] = useState(null);
    const [arquivoAlterado, setArquivoAlterado] = useState(false);
    const [demandas, setDemandas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [temErroArquivo, setTemErroArquivo] = useState(false);

    const [btnNovaDemanda, setBtnNovaDemanda] = useState(false);

    const atualizarIsDirty = (estado) => {// ATUALIZA EXIBIÇÃO DO BOTÃO SALVAR
        setArquivoAlterado(estado);
    };

    const arquivoId = watch("arquivo_id");  // observa o campo do form

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


    const aoEnviar = async (data) => {
        const listaChaves = Object.keys(data);
        data.colecao = colecao;
        data.arquivo = arquivo;

        try {
            // Verificação se há arquivo nos casos em que é obrigatório
            if (!arquivo) {
                setTemErroArquivo(true)
                throw new Error("É necessário realizar upload do Caderno de Necessidades")
            }
            const resp = await onSubmit(data, pagina, listaChaves);
            toast.success(resp.message);

            if (window.opener) {//opener é a janela que abriu este componente como popup
                window.opener.atualizarPagina();//executa a função global no opener (atualizarPagina está no App.jsx)
                setTimeout(() => {
                    window.close();//fecha o componente atual após um tempo para o toast ser exibido
                }, 1500);

            } else navigate(`/main/confirmacaocn?id_cn=${resp.obj.id_cn}`);
            //reset(resp.obj);

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



    const aoSelecionarDemanda = (event) => {
        const escolha = event.target.value;
        const novaEscolha = escolha === 'Não se aplica';
        if (btnNovaDemanda !== novaEscolha) {
            setBtnNovaDemanda(novaEscolha);
        }
    }



    return (
        <>
            <div className='formulario-titulo'>
                <h3>Formulário: Caderno de Necessidades</h3>
            </div>

            <div className='formulario-main'>
                <div className='formulario-content'>
                    <div className='linha'>
                        <DirinfraSelect
                            label='Demanda'
                            name='id_demanda'
                            registro={register}
                            required={true}
                            options={demandas.map(demanda => ({
                                value: demanda.id_demanda,
                                label: `${demanda.id_demanda} ${demanda.apelido_demanda || ''}`
                            }))}
                            erros={errors}
                            placeholder='Selecione a demanda a qual esse CN está associado'
                            onChange={aoSelecionarDemanda}
                        />
                    </div>
                    {btnNovaDemanda && (
                        <div className="linha" style={{ marginTop: '0' }}>
                            <button
                                style={{ width: '100%', margin: '0 10px' }}
                                onClick={() => window.location.href = '/main/home/cadastrar/demandas'}
                            >
                                Registrar nova demanda
                            </button>
                        </div>
                    )}

                    <div className='linha'>
                        <DirinfraInput
                            // orientacao="column"
                            name='data_doc_cn'
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
                            // orientacao="column"
                            name='doc_sigadaer'
                            erros={errors}
                            label='Documento SIGADAER do Caderno de Necessidades'
                            placeholder='Ofício nºXXX/YYYYY/ZZZZ'
                            registro={register}
                            required={false}
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraInput
                            // orientacao="column"
                            name='data_sigadaer'
                            erros={errors}
                            label='Data do documento do SIGADAER'
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={false}
                            type='date'
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraSelect
                            label='Elo Cadastro'
                            name='elo_cadastro'
                            registro={register}
                            required={true}
                            options={[
                                "DIRINFRA", "GAC INFRA-AN", "GECAMP", "CEPE", "COMARA", "SERINFRA-BE",
                                "SERINFRA-BR", "SERINFRA-CO", "SERINFRA-MN", "SERINFRA-NT", "SERINFRA-RJ",
                                "SERINFRA-SJ", "DACO MN",
                            ]}
                            erros={errors}
                            placeholder='Elo responsável por analisar o Caderno de Necessidades'
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraTextArea
                            name='obs_cn'
                            erros={errors}
                            label='Observações'
                            placeholder='Digite aqui as informações relevantes sobre esse Caderno de Necessidades que não foram destacadas nos campos anteriores.'
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

export default CNForm;