import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from "react-router-dom";

import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';

import demandaService from '../../../services/demandaService';
import etpeService from '../../../services/etpeService';

import {
    listarDados,
    onError,
    onSubmit,
    receberArquivo,
    redirecionar
} from '../../../utils/gerCrud';
import DirinfraTextarea from '../../DirinfraTextarea/DirinfraTextarea';

const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    }).format(valor);
};

const desformatarMoeda = (valorFormatado) => {
    return Number(valorFormatado.replace(/[^0-9,-]+/g, '').replace(',', '.'));
};

const PropostaForm = () => {

    const { register, handleSubmit, formState: { errors, isDirty }, reset, watch, setValue } = useForm();

    const { id } = useParams();//se for para editar, pega id na url
    const navigate = useNavigate();
    const pagina = id ? 'Editar' : 'Criar';
    const colecao = 'propostas';

    const [arquivo, setArquivo] = useState(null);
    const [arquivoAlterado, setArquivoAlterado] = useState(false);
    const [demandas, setDemandas] = useState([]);
    const [etpes, setETPEs] = useState([]);
    const [demandaSelecionada, setDemandaSelecionada] = useState();
    const [etpeSelecionado, setETPESelecionado] = useState();
    const [solucoes, setSolucoes] = useState([]);

    const [temErroArquivo, setTemErroArquivo] = useState(false);

    const [btnNovaDemanda, setBtnNovaDemanda] = useState(false);
    const [valorFormatado, setValorFormatado] = useState('');

    const [ECPDiferente, setECPDiferente] = useState('Não');

    const atualizarIsDirty = (estado) => {// ATUALIZA EXIBIÇÃO DO BOTÃO SALVAR
        setArquivoAlterado(estado);
    };


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
            // Verificação se há arquivo nos casos em que é obrigatório
            // if (!arquivo) {
            //     setTemErroArquivo(true)
            //     throw new Error("É necessário realizar upload do Caderno de Necessidades")
            // }
			const resp = await onSubmit(data, pagina, listaChaves);
            toast.success(resp.message);
            
            if (window.opener) {//opener é a janela que abriu este componente como popup
                window.opener.atualizarPagina();//executa a função global no opener (atualizarPagina está no App.jsx)
                setTimeout(() => {
                    window.close();//fecha o componente atual após um tempo para o toast ser exibido
                }, 1500);

            } else navigate(`/main/confirmacaoproposta?id_proposta=${resp.obj.id_proposta}`);
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
                setDemandas(listaDemandas.data)
            } catch (error) {
                toast.error("Erro ao carregar a lista de demandas");
            }
        };

        fetchDemandas();
    }, []);

    // useEffect para mapear a lista de ETPEs do banco
    useEffect(() => {

        const fetchETPEs = async () => {
            try {
                const id_demanda = demandaSelecionada
                const listaETPEs = await etpeService.lerETPEs(id_demanda ? id_demanda : undefined);

                setETPEs(listaETPEs.data)
            } catch (error) {
                toast.error("Erro ao carregar a lista de ETPEs");
            }
        };
        fetchETPEs();
    }, [demandaSelecionada]);

    // useEffect para mapear as soluções do ETPE selecionado
    useEffect(() => {

        const fetchSolucoes = async () => {
            try {
                const id_etpe = etpeSelecionado
                const listaSolucoes = await etpeService.buscarSolucoesPorETPE(id_etpe ? id_etpe : undefined);
                setSolucoes(listaSolucoes)
            } catch (error) {
                toast.error("Erro ao carregar a lista de Soluções");
            }
        };
        fetchSolucoes();
    }, [etpeSelecionado]);


    const aoSelecionarDemanda = (event) => {
        const escolha = event.target.value;
        setDemandaSelecionada(escolha);
        const novaEscolha = escolha === 'Não se aplica';
        if (btnNovaDemanda !== novaEscolha) {
            setBtnNovaDemanda(novaEscolha);
        }
    }

    const aoSelecionarETPE = (event) => {
        const escolha = event.target.value;
        if (!escolha) {
            setECPDiferente('Sim');
        }
        setETPESelecionado(escolha);
    }

    const handleValorChange = (event) => {
        const inputValue = event.target.value;
        setValorFormatado(inputValue);
    };

    const handleBlur = () => {
        const valorNumerico = desformatarMoeda(valorFormatado);
        const valorFormatadoMoeda = formatarMoeda(valorNumerico);
        setValorFormatado(valorFormatadoMoeda); // Atualiza o estado para exibir o valor formatado
        setValue('ecp_valor', valorNumerico); // Define o valor desformatado para envio ao backend
    };

    // useEffect(() => {
    //     if (valorFormatado) {
    //         const valorNumerico = desformatarMoeda(valorFormatado);
    //         const valorFormatado = formatarMoeda(valorNumerico);
    //         setValorFormatado(valorFormatado); // Formata o valor ao montar o componente
    //     }
    // }, [valorFormatado]);



    return (
        <>
            <div className='formulario-titulo'>
                <h3>Formulário: Proposta PLANINFRA</h3>
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
                            placeholder='Selecione a demanda a qual essa Proposta está associada'
                            onChange={aoSelecionarDemanda}
                        />
                    </div>
                    {btnNovaDemanda && (
                        <div className="linha" style={{ marginTop: '0' }}>
                            <button
                                style={{width: '100%', margin: '0 10px'}}
                                onClick={() => window.location.href = '/main/home/cadastrar/demandas'}
                            >
                                Registrar nova demanda
                            </button>
                        </div>
                    )}

                    <div className='linha'>
                        <DirinfraSelect
                            label='ETPE'
                            name='id_etpe'
                            registro={register}
                            options={etpes.map(etpe => ({
                                value: etpe.id_etpe,
                                label: `${etpe.id_etpe}`
                            }))}
                            erros={errors}
                            placeholder='Selecione o ETPE a qual essa Proposta está associada'
                            onChange={aoSelecionarETPE}
                        />
                    </div>

                    {etpeSelecionado && (
                    <div className='linha'>
                        <DirinfraSelect
                            label='Solução'
                            name='solucao_etpe_escolhida'
                            registro={register}
                            options={solucoes.map(solucao => ({
                                value: solucao.nume_solucao,
                                label: `${solucao.nume_solucao}`
                            }))}
                            erros={errors}
                            placeholder='Selecione a solução do ETPE a qual essa Proposta está associada'
                        />
                    </div>
                    )}

                    <div className='linha'>
                        <DirinfraInput
                            // orientacao="column"
                            name='id_planinfra'
                            erros={errors}
                            label='ID PLANINFRA'
                            placeholder='Será atribuído pela DIRINFRA'
                            registro={register}
                            disabled
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraInput
                            // orientacao="column"
                            name='doc_sigadaer'
                            erros={errors}
                            label='Documento SIGADAER da Proposta'
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
                            label='Data do documento SIGADAER'
                            placeholder='DD/MM/AAAA'
                            registro={register}
                            required={false}
                            type='date'
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraInput
                            // orientacao="column"
                            name='status_proposta'
                            erros={errors}
                            label='Status da Proposta'
                            placeholder='Será atribuído pela DIRINFRA'
                            registro={register}
                            disabled
                        />
                    </div>
                    <div className='linha'>
                        <DirinfraSelect
                            label='Origem dos Recursos'
                            name='origem_recursos'
                            registro={register}
                            required={true}
                            options={[
                                "Recursos Próprios da OM Solicitante", "Recursos Providenciados pela DIRINFRA"
                            ]}
                            watch={watch}
                            erros={errors}
                            placeholder='Indicar se a proposta possui recursos próprios para execução ou se a DIRINFRA deverá providenciar'
                        />
                    </div>



                    <div className='linha'>
                        <DirinfraSelect
                            label="Deseja usar uma Estimativa de Custo Preliminar Diferente do ETPE?"
                            name='ecp_diferente'
                            options={['Sim', 'Não']}
                            registro={register}
                            watch={watch}
                            onChange={(e) => setECPDiferente(e.target.value)}
                            erros={errors}
                            required={true}
                        />
                    </div>

                    {ECPDiferente === 'Sim' && (
                        <>
                        <div className='linha'>
                            <DirinfraInput
                                label="Estimativa de Custo Preliminar"
                                type="text"
                                name="ecp_valor"
                                registro={register}
                                value={valorFormatado}
                                placeholder='Insira o valor da ECP se esta for diferente do ETPE ou não houver ETPE'
                                erros={errors}
                                required={false}
                                onChange={handleValorChange}
                                onBlur={handleBlur} // Formata ao perder o foco
                            />
                        </div>
                        <div className='linha'>
                            <DirinfraInput
                                // orientacao="column"
                                name='ecp_data'
                                erros={errors}
                                label='Data Aproximada em que a Estimativa acima foi Realizada'
                                placeholder='DD/MM/AAAA'
                                registro={register}
                                required={false}
                                type='date'
                            />
                        </div>
                        </>
                    )}    


                    <div className='linha'>
                        <DirinfraInput
                            label="Prioridade do ODS"
                            name='prioridade_ods'
                            registro={register}
                            watch={watch}
                            disabled
                            required={false}
                            erros={errors}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraSelect
                            label="Gravidade - GUT"
                            name='g_gut'
                            options={[{ value: 5, label: '5 - Extremamente grave' }, { value: 4, label: '4 - Muito grave' }, { value: 3, label: '3 - Grave' }, { value: 2, label: '2 - Pouco grave' }, { value: 1, label: '1 - Sem gravidade' }]}
                            registro={register}
                            watch={watch}
                            required={true}
                            erros={errors}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraSelect
                            label="Urgência - GUT"
                            name='u_gut'
                            options={[{ value: 5, label: '5 - Precisa de ação imediata' }, { value: 4, label: '4 - Urgente' }, { value: 3, label: '3 - O mais rápido possível' }, { value: 2, label: '2 - Pouco urgente' }, { value: 1, label: '1 - Pode esperar' }]}
                            registro={register}
                            watch={watch}
                            required={true}
                            erros={errors}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraSelect
                            label="Tendência - GUT"
                            name='t_gut'
                            options={[{ value: 5, label: '5 - Irá piorar rapidamente' }, { value: 4, label: '4 - Irá piorar em pouco tempo' }, { value: 3, label: '3 - Irá piorar' }, { value: 2, label: '2 - Irá piorar a longo prazo' }, { value: 1, label: '1 - Não irá mudar' }]}
                            registro={register}
                            watch={watch}
                            required={true}
                            erros={errors}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraSelect
                            label="Categoria de Infraestrutura"
                            name='categoria_infraestrutura'
                            options={[{ value: 'A', label: 'A - Projetos Estratégicos FAB, Termos de Execução Descentralizada (TED)' }, { value: 'B', label: 'B - Permutas por obras a construir, Recuperação de infraestrutura aeroportuária militar, Operações de Engenharia de Campanha, Infraestrutura básica' }, { value: 'C', label: 'C - Outras Demandas dos ODS' }, ]}
                            registro={register}
                            watch={watch}
                            required={true}
                            erros={errors}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraSelect
                            label="Classe"
                            name='classe_proposta'
                            options={[{ value: 1, label: 'Classe 1 - Melhorias' }, { value: 2, label: 'Classe 2 - Implantação ou ampliação de benfeitorias' }, { value: 3, label: 'Classe 3 - Recuperação de capacidade' }, { value: 4, label: 'Classe 4 - Atendimento à legislação' }, { value: 5, label: 'Classe 5 - Atendimento à determinação de Órgão externo ao COMAER'}]}
                            registro={register}
                            watch={watch}
                            required={true}
                            erros={errors}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraSelect
                            label="Atende à atividade-fim da Organização Militar"
                            name='atividade_fim_proposta'
                            options={[{ value: 'Sim', label: 'Sim' }, { value: 'Não', label: 'Não' }]}
                            registro={register}
                            watch={watch}
                            required={true}
                            erros={errors}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraSelect
                            label="Implantação ou ampliação contemplada em Plano Diretor?"
                            name='plano_diretor_proposta'
                            options={[{ value: 'Não contemplada', label: 'Não contemplada' }, { value: 'Contemplada', label: 'Contemplada' }, { value: 'Não se aplica (caso de reformas ou recuperações)', label: 'Não se aplica (caso de reformas ou recuperações)' }]}
                            registro={register}
                            watch={watch}
                            required={true}
                            erros={errors}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraSelect
                            label="Plano de Manutenção Predial"
                            name='pmp_proposta'
                            options={[{ value: 'PMP inexistente ou desatualizado', label: 'PMP inexistente ou desatualizado' },
                                { value: 'PMP em vigor, porém a demanda não consta no Relatório Anual', label: 'PMP em vigor, porém a demanda não consta no Relatório Anual' },
                                { value: 'Demanda consta no Relatório Anual', label: 'Demanda consta no Relatório Anual' },
                                { value: 'Não se aplica, pois se trata de implantação ou ampliação de benfeitoria, ou proposta de obra para infraestrutura básica, que não possui PMP', label: 'Não se aplica, pois se trata de implantação ou ampliação de benfeitoria, ou proposta de obra para infraestrutura básica, que não possui PMP' }]}
                            registro={register}
                            watch={watch}
                            required={true}
                            erros={errors}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraSelect
                            label="Repetições da Proposta"
                            name='repeticao_proposta'
                            options={[{ value: 0, label: 'Nenhuma vez' },
                            { value: 1, label: 'Uma vez' },
                            { value: 2, label: 'Duas vezes' },
                            { value: 3, label: 'Três vezes' },
                            { value: 4, label: 'Quatro ou mais vezes' }]}
                            registro={register}
                            watch={watch}
                            required={true}
                            erros={errors}
                        />
                    </div>

                    <div className='linha'>
                        <DirinfraTextarea
                            name='obs_proposta'
                            erros={errors}
                            label='Observações'
                            placeholder='Digite aqui as informações relevantes sobre essa Proposta que não foram destacadas nos campos anteriores.'
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
                {/* <div className='formulario-content'>
                    <GerenciadorDeArquivo arquivo={arquivo} setArquivo={setArquivo} atualizarIsDirty={atualizarIsDirty} temErroArquivo={temErroArquivo} setTemErroArquivo={setTemErroArquivo}/>
                </div> */}
            </div>
        </>
    );
};

export default PropostaForm;