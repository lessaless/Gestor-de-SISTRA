import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from "react-router-dom";

import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
// import AutorForm from '../AutorForms';
// import SolucaoForm from '../SolucaoForm';

import demandaService from '../../../services/demandaService';
import cnService from '../../../services/cnService';
import etpeService from '../../../services/etpeService';
import statusService from '../../../services/statusService';
import utilService from '../../../services/utilService';

import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';
import DirinfraTextArea from '../../DirinfraTextArea/DirinfraTextArea';
import DirinfraListSelect from '../../DirinfraSelect/DirinfraListSelect';
import { useSalvar } from '../../../utils/SalvarContext';


import {
	listarDados,
	onError,
	onSubmit,
	receberArquivo,
	redirecionar
} from '../../../utils/gerCrud';


const PLANINFRAForm = () => {

	const contexto = useFormContext();        // pode ser undefined
	const localForm = useForm();        // sempre chamado
	const metodo = contexto || localForm;
	const { onSaved, onDesvincular } = useSalvar() || {}; // pega função do pai
	const { register, handleSubmit, formState: { errors, isDirty }, reset, control, getValues, setValue, watch } = metodo;

	const data = watch();
	const { id, id_demanda } = useParams();//se for para editar, pega id na url
	const [status, setStatuses] = useState([]);
	const [fasesDoProjeto, setFasesDoProjeto] = useState([]);

	const pagina = id || data?._id ? 'Editar' : 'Criar';
	const colecao = 'planinfra';
	const currentId = watch('id_demanda')
	const navigate = useNavigate();
	const [arquivo, setArquivo] = useState(null);
	const [arquivoAlterado, setArquivoAlterado] = useState(false);
	const [temErroArquivo, setTemErroArquivo] = useState(false);
	const [demandas, setDemandas] = useState([]);
	const [idDemanda, setIdDemanda] = useState('');
	const [idStatus, setStatus] = useState('');
	const [cns, setCNs] = useState([]);
	const [etpes, setETPEs] = useState([]);
	const [planinfras, setPLANINFRAs] = useState([]);
	const [btnNovaDemanda, setBtnNovaDemanda] = useState(false);
	const [codigoBimPlaninfra, setCodigoBimPlaninfra] = useState('');
	const [codigoBimGerado, setCodigoBimGerado] = useState('');
	const [municipios, setMunicipios] = useState([]);
	const [apelidoEscolhido, setApelidoEscolhido] = useState('Epíteto');
	const [omEscolhida, setOmEscolhida] = useState('OM');
	const [municipioEscolhido, setMunicipioEscolhido] = useState('');
	const [estados, setEstados] = useState([]);
	const [estado, setEstado] = useState('UF');
	const [cidade, setCidade] = useState([]);
	const [localidade, setLocalidade] = useState([]);
	const [oms, setOms] = useState([]);

	const atualizarIsDirty = (estado) => {// ATUALIZA EXIBIÇÃO DO BOTÃO SALVAR
		setArquivoAlterado(estado);
	};
	const demandaSelecionada = demandas.find(d =>
		d._id === currentId || d.id_demanda === currentId   // cobre _id OU código humano
	);
	const estadoDemanda = demandaSelecionada?.estado_demanda ?? '';
	console.log(`O valor de estadoDemanda: ${estadoDemanda}`);
	const benfeitoriaDemanda = demandaSelecionada?.benfeitoria_bim ?? '';
	console.log(`O valor de benfeitoriaDemanda: ${benfeitoriaDemanda}`);
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
				// console.log("Resp:", resp)
				//console.log("Resp do DemandaForm buscarDado", resp)

				//formatar as datas para o formulário string > Date > ISOString
				window.dataParaFormulario(resp[0]);

				//Exibir no 'Nome Final da Demanda' os itens abaixo, quando existentes
				if (resp[0].apelido_demanda) setApelidoEscolhido(resp[0].apelido_demanda);
				if (resp[0].om_objeto) setOmEscolhida(resp[0].om_objeto);
				if (resp[0].cidade_demanda) setCidade(resp[0].cidade_demanda);
				if (resp[0].estado_demanda) setEstado(resp[0].estado_demanda);


				reset(resp[0]);

				if (resp[0].arquivo_id) {
					const arquivoObj = await receberArquivo(resp[0].arquivo_id);
					setArquivo(arquivoObj);
				};

				//setIsLoading(false);

			} catch (error) {
				toast.error(error.message);

				// setTimeout(() => {//se o id for inválido...
				// 	redirecionar('Listar');
				// }, 1500); DESCOMENTAR!

			}
		};

		if (!id) return;//Busca dados caso tenha recebido id no URL
		buscarDado();
	}, [id, reset]);







	const aoEnviar = async (data) => {
		//console.log("Dados enviados nafunção aoEnviar", data)
		const listaChaves = Object.keys(data);
		// console.log(`o valor de listaChaves é ${listaChaves}`)
		//console.warn(listaChaves)
		data.colecao = colecao;
		data.arquivo = arquivo;

		// try {
		// 	if ((data.length ?? 0) === 0) {
		// 		 throw new Error("É necessário ter pelo menos um autor!");
		// }

		// if ((data.length ?? 0) === 0) {
		// 		throw new Error("É necessário ter pelo menos uma solução!");
		// }
		if (data.id_demanda === "_desvincular") {
			data.id_demanda = null;
		} else if (!data.id_demanda && id_demanda) {
			data.id_demanda = id_demanda;
		}
		const dSel = demandas.find(x => x._id === (data.id_demanda || currentId) || x.id_demanda === (data.id_demanda || currentId));
		const estado = dSel?.estado_demanda ?? '';
		console.log("O valor de estado_demanda é", estado)
		const cidade = dSel?.cidade_demanda ?? '';
		console.log("O valor de cidade_demanda é", cidade)
		const localidade = dSel?.localidade_demanda ?? '';
		console.log("O valor de localidade_demanda é", localidade)
		const benfeitoria = dSel?.benfeitoria_bim ?? '';
		console.log("O valor de benfeitoria é", benfeitoria)
		// now guaranteed from demandas
		data.estado_demanda = estado
		setEstado(data.estado_demanda)
		data.cidade_demanda = cidade
		setCidade(data.cidade_demanda)
		data.localidade_demanda = localidade
		setLocalidade(data.localidade_demanda)
		data.codigo_bim_planinfra = `${estado}${localidade}-${benfeitoria}`;
		console.log("estado do codigo bim", estado);
		console.log("localidade do codigo bim", localidade);
		console.log("benfeitoria do codigo bim", benfeitoria);
		console.log("codigo_bim_planinfra ", data.codigo_bim_planinfra);
		setCodigoBimPlaninfra(data.codigo_bim_planinfra);
		// data.estado_demanda = estado
		// setEstado(data.estado_demanda)
		if (!arquivo) {
			setTemErroArquivo(true)
			toast.error("É necessário realizar upload do Ofício aprovando o PLANINFRA.")
			throw new Error("É necessário realizar upload do Ofício aprovando o PLANINFRA.")
		}
		console.log("o valor de data é ", data)

		const resp = await onSubmit(data, pagina, listaChaves);
		// console.log(`o valor de resp.obj.id_planinfra é ${resp.obj.id_planinfra}`)
		toast.success(resp.message);

		if (window.opener) {//opener é a janela que abriu este componente como popup
			window.opener.atualizarPagina();//executa a função global no opener (atualizarPagina está no App.jsx)
			setTimeout(() => {
				window.close();//fecha o componente atual após um tempo para o toast ser exibido
			}, 1500);

		} else navigate(`/main/confirmacaoplaninfra?id_planinfra=${resp.obj.id_planinfra}`);
		//reset(resp.obj);

		// } catch (error) {
		// 	toast.error(error.message);
	};
	// };

	const aoErrar = (errors) => {
		try {
			onError(errors);
		} catch (error) {
			toast.error(error.message);
		}
	}

	//Função para atualizar o estado de id_demanda quando algo for selecionado no select
	// const handleIdDemandaChange = (event) => {
	// 	const escolha = event.target.value;
	// 	const novaEscolha = escolha === 'Não se aplica';
	// 	if (btnNovaDemanda !== novaEscolha) {
	// 		setBtnNovaDemanda(novaEscolha);
	// 	}


	// 	setIdDemanda(event.target.value);
	// };


	// useEffect para mapear a lista de demandas do banco
	// useEffect(() => {
	// 	const fetchDemandas = async () => {
	// 		try {
	// 			const listaDemandas = await demandaService.lerDemandas();
	// 			const opcaoNovaDemanda = [
	// 				{ apelido_demanda: '', id_demanda: 'Não se aplica' },
	// 				...listaDemandas.data
	// 			];
	// 			setDemandas(opcaoNovaDemanda);
	// 		} catch (error) {
	// 			toast.error("Erro ao carregar a lista de demandas");
	// 		}
	// 	};

	// 	fetchDemandas();
	// }, []);

	// useEffect para mapear a lista de demandas do banco
	useEffect(() => {
		const fetchDemandas = async () => {
			try {
				const listaDemandas = await demandaService.lerDemandas();

				// Pega o id_demanda dos params da URL
				const currentIdDemanda = id_demanda || watch('id_demanda');

				// Se existe id_demanda, filtra para mostrar apenas essa demanda
				let demandasFiltradas = listaDemandas.data;
				if (currentIdDemanda) {
					demandasFiltradas = listaDemandas.data.filter(
						d => d._id === currentIdDemanda || d.id_demanda === currentIdDemanda
					);
				}

				// Adiciona a opção "Não se aplica" apenas se não houver id_demanda predefinido
				const opcoes = currentIdDemanda
					? demandasFiltradas
					: [
						{ apelido_demanda: '', id_demanda: 'Não se aplica' },
						...demandasFiltradas
					];

				setDemandas(opcoes);

				// Se houver apenas uma demanda (a filtrada), pré-seleciona ela
				if (currentIdDemanda && demandasFiltradas.length === 1) {
					setValue('id_demanda', demandasFiltradas[0].id_demanda);
				}

			} catch (error) {
				toast.error("Erro ao carregar a lista de demandas");
			}
		};

		fetchDemandas();
	}, [id_demanda]); // Atualiza quando id_demanda dos params mudar

	// // useEffect para mapear a lista de cns do banco
	// useEffect(() => {
	// 	const fetchCNs = async () => {
	// 		try {
	// 			const listaCNs = await cnService.lerCNs(idDemanda ? idDemanda : undefined);
	// 			//console.log(listaCNs)
	// 			setCNs(listaCNs.data);
	// 		} catch (error) {
	// 			toast.error("Erro ao carregar a lista de CNs");
	// 		}
	// 	};
	// 	fetchCNs();
	// }, [idDemanda]);

	// useEffect para mapear a lista de cns do banco
	useEffect(() => {
		const fetchCNs = async () => {
			try {
				const listaCNs = await listarDados({ 'colecao': 'cadernodenecessidades' });
				// Pega o id_demanda do formulário atual
				const currentIdDemanda = data?.id_demanda || id_demanda;
				console.log("Valor de currentIdDemanda é", currentIdDemanda)
				// Filtra os CNs que têm o mesmo id_demanda
				const cnsFilteredByDemanda = currentIdDemanda
					? listaCNs.filter(cn => cn.id_demanda === currentIdDemanda)
					: listaCNs;
				const newLista = [...cnsFilteredByDemanda, { id_gerais: 'Não se aplica' }];
				setCNs(newLista);
				console.log("Valor de newLista é", newLista)
			} catch (error) {
				toast.error("Erro ao carregar a lista de CNs");
			}
		};
		fetchCNs();
	}, [data?.id_demanda, id_demanda]);

	// useEffect(() => {
	// 	const fetchETPEs = async () => {
	// 		try {
	// 			const listaETPEs = await etpeService.lerETPEs(idDemanda ? idDemanda : undefined);
	// 			//console.log(listaCNs)
	// 			setETPEs(listaETPEs.data);
	// 		} catch (error) {
	// 			toast.error("Erro ao carregar a lista de ETPEs");
	// 		}
	// 	};
	// 	fetchETPEs();
	// }, [idDemanda]);


	// useEffect para mapear a lista de etpes do banco
	// useEffect(() => {
	// 	const fetchETPEs = async () => {
	// 		try {
	// 			// Pega o id_demanda atual do formulário
	// 			const currentIdDemanda = watch('id_demanda') || idDemanda;

	// 			// Passa o id_demanda para o service filtrar
	// 			const listaETPEs = await etpeService.lerETPEs(currentIdDemanda ? currentIdDemanda : undefined);

	// 			setETPEs(listaETPEs.data);
	// 		} catch (error) {
	// 			toast.error("Erro ao carregar a lista de ETPEs");
	// 		}
	// 	};
	// 	fetchETPEs();
	// }, [watch('id_demanda'), idDemanda]); // Atualiza quando id_demanda mudar
	useEffect(() => {
		const fetchETPEs = async () => {
			try {
				const listaETPEs = await listarDados({ 'colecao': 'estudotpengenharia' });

				// Pega o id_demanda do formulário atual
				const currentIdDemanda = data?.id_demanda || id_demanda;
				console.log("Valor de currentIdDemanda para ETPEs é", currentIdDemanda);

				// Filtra os ETPEs que têm o mesmo id_demanda
				const etpesFilteredByDemanda = currentIdDemanda
					? listaETPEs.filter(etpe => etpe.id_demanda === currentIdDemanda)
					: listaETPEs;

				const newLista = [...etpesFilteredByDemanda, { id_gerais: 'Não se aplica' }];
				setETPEs(newLista);
				console.log("Valor de newLista de ETPEs é", newLista);

			} catch (error) {
				toast.error("Erro ao carregar a lista de ETPEs");
			}
		};
		fetchETPEs();
	}, [data?.id_demanda, id_demanda]);





	const aoSelecionarDemanda = (event) => {
		const escolha = event.target.value;
		const novaEscolha = escolha === 'Não se aplica';
		if (btnNovaDemanda !== novaEscolha) {
			setBtnNovaDemanda(novaEscolha);
		}
	}




	// useEffect para mapear a lista de oms e ods do banco
	useEffect(() => {
		//console.log("Mapear lista oms")
		const fetchOms = async () => {
			try {
				// const listaOMs = await utilService.obterOMs();
				// const listaODS = await utilService.obterODS();
				const listaEstados = await utilService.obterEstados();
				// setOms(listaOMs.data);
				// setOds(listaODS.data);
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

	useEffect(() => {
		//console.log("Mapear lista oms")
		const fetchStatus = async () => {
			try {
				// const listaOMs = await utilService.obterOMs();
				// const listaODS = await utilService.obterODS();
				const listaStatus = await utilService.obterStatus();
				// setOms(listaOMs.data);
				// setOds(listaODS.data);
				setStatuses(listaStatus.data);
				console.log("Valores de Status é ", listaStatus.data)

			} catch (error) {
				toast.error("Erro ao carregar Status");
			}
		};

		fetchStatus();
	}, []);
	// useEffect(() => {
	// 	//console.log("Mapear lista oms")
	// 	const fetchFasesDoProjeto = async () => {
	// 		try {
	// 			// const listaOMs = await utilService.obterOMs();
	// 			// const listaODS = await utilService.obterODS();
	// 			const listaFasesDoProjeto = await utilService.obterFasesDoProjeto();
	// 			// setOms(listaOMs.data);
	// 			// setOds(listaODS.data);
	// 			setFasesDoProjeto(listaFasesDoProjeto.data);
	// 			console.log("Valores de Fases do Projeto é ", listaFasesDoProjeto.data)

	// 		} catch (error) {
	// 			toast.error("Erro ao carregar Fases do Projeto");
	// 		}
	// 	};

	// 	fetchFasesDoProjeto();
	// }, []);

	useEffect(() => {
		//console.log("Mapear lista oms")
		const fetchOms = async () => {
			try {
				const listaOMs = await utilService.obterOMs();
				setOms(listaOMs.data);
			} catch (error) {
				toast.error("Erro ao carregar OMs, ODS ou Estados");
			}
		};

		fetchOms();
	}, []);

	//useEffect para mapear a lista de terrenos do banco
	// useEffect(() => {
	// 	const fetchTerrenos = async () => {
	// 		try {
	// 			//console.log("Terrenos obtidos")
	// 			const resultado = await utilService.obterTerrenos();
	// 			//console.log("Terrenos obtidos", resultado.data)
	// 			const terrenosObtidos = resultado.data.map(item => ({
	// 				label: `${item.NR_TOMBO}`,
	// 				value: `${item.NR_TOMBO}`,
	// 				endereco: `${item.endereco}`,
	// 			}));
	// 			setTerrenos(terrenosObtidos);
	// 		} catch (error) {
	// 			console.error('Erro ao obter a lista dos Terrenos', error);
	// 		}
	// 	};

	// 	fetchTerrenos();
	// }, []);


	// useEffect para mapear a lista de status do banco
	// useEffect(() => {
	// 	const fetchStatus = async () => {
	// 		try {
	// 			const listaStatus = await statusService.lerStatus(idStatus ? idStatus : undefined);
	// 			//console.log(listaCNs)
	// 			setStatus(listaStatus.data);
	// 		} catch (error) {
	// 			toast.error("Erro ao carregar a lista de status");

	// 		}
	// 	};
	// 	fetchStatus();
	// }, [idStatus]);
	// api/status/buscarstatus 

	const opcoesRecurso = [
		"AEB - FUNDAÇÕES",
		"CESSÃO ONEROSA",
		"CONVÊNIO - SEDOP",
		"Cessão Onerosa",
		"EMENDA PARLAMENTAR",
		"FAB",
		"FAB 147F",
		"FAB 14UC",
		"FAB 2000",
		"FAB 2004",
		"FAB 20SA",
		"FAB 20X6",
		"FAB 20XV",
		"FAB 212B",
		"OUTRO"
	];
	return (
		<>
			<div className='formulario-titulo'>
				<h3>Formulário: Plano de Planejamento de Infraestrutura </h3>
			</div>

			<div className='formulario-main'>
				<div className='formulario-content'>
					<div className='linha'>
						<DirinfraInput
							// orientacao="column"
							name='id_planinfra'
							erros={errors}
							label='ID segundo PLANINFRA'
							placeholder='AAAA-XYZW'
							registro={register}
							required={false}
						//required={false}
						/>
					</div>
					<div className='linha'>
						<DirinfraSelect
							label='Demanda'
							name='id_demanda'
							registro={register}
							required={true}
							options={demandas.map(demanda => ({
								value: demanda.id_demanda,
								label: `${demanda.id_demanda} `
							}))}
							erros={errors}
							placeholder='Selecione a demanda a qual este ID PLANINFRA está associado'
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
						<DirinfraSelect
							label='Caderno de Necessidades'
							name='id_cn'
							registro={register}
							required={false}
							options={cns.map(cn => ({
								value: cn.id_gerais,
								label: `${cn.id_gerais}`
							}))}
							erros={errors}
							placeholder='Selecione o CN a qual esse ID PLANINFRA está associado'
							watch={watch}
						/>
					</div>

					<div className='linha'>
						<DirinfraSelect
							label='ETPE'
							name='id_etpe'
							registro={register}
							required={false}
							options={etpes.map(etpe => ({
								value: etpe.id_gerais,
								label: `${etpe.id_gerais}`
							}))}
							erros={errors}
							placeholder='Selecione o ETPE a qual esse ID PLANINFRA está associado'
							watch={watch}
						/>
					</div>

					<div className='linha'>
						<DirinfraSelect
							label='Status'
							name='id_status'
							registro={register}
							required={true}
							options={status.map(st => ({
								value: st.status,
								label: st.status
							}))}
							erros={errors}
							placeholder='Selecione o Status deste ID PLANINFRA'
							watch={watch}
						/>
					</div>

					<div className='linha'>
						<DirinfraSelect
							label='Recurso'
							name='id_origem_recurso'
							registro={register}
							required={true}
							options={opcoesRecurso.map(recurso => ({
								value: recurso,
								label: recurso
							}))}
							erros={errors}
							placeholder='Selecione a origem do recurso deste ID PLANINFRA'
							watch={watch}
						/>
					</div>
					<div className='linha'>
						<DirinfraListSelect
							label='OM Responsável pelo Recurso'
							name='id_responsavel_recurso'
							registro={register}
							required={true}
							options={oms.map(om => ({ value: om, label: om }))}
							erros={errors}
							placeholder='Selecione o nome da OM'
							setValue={setValue} //Obrigatório para o componente DirinfraListSelect
							watch={watch}

						/>
					</div>
					<div className='linha'>
						<DirinfraInput
							// orientacao="column"
							name='data_doc_etpe'
							erros={errors}
							label='Data do ETPE'
							placeholder='DD/MM/AAAA'
							registro={register}
							//required={true}
							type='date'
							required={true}
						/>
					</div>
					<div className='linha'>
						<DirinfraInput
							// orientacao="column"
							name='doc_sigadaer'
							erros={errors}
							label='Documento SIGADAER do ID PLANINFRA'
							placeholder='Ofício nºXXX/YYYYY/ZZZZ'
							registro={register}
							required={false}
						//required={false}
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
							label='Elo Responsável'
							name='elo_resp'
							registro={register}
							required={true}
							options={[
								"DIRINFRA", "GAC INFRA-AN", "GECAMP", "CEPE", "COMARA", "SERINFRA-BE",
								"SERINFRA-BR", "SERINFRA-CO", "SERINFRA-MN", "SERINFRA-NT", "SERINFRA-RJ",
								"SERINFRA-SJ", "DACO MN", "Nenhuma das opções anteriores"
							].map(elo => ({
								value: elo,
								label: elo
							}))}  // ✅ Now it's an array of objects like the others
							erros={errors}
							placeholder='Elo responsável pelo ID PLANINFRA'
							watch={watch}
						/>
					</div>

					{/* <div className='linha'>
						<DirinfraSelect
							label='Elo Responsável 2'
							name='elo_resp'
							registro={register}
							required={true}
							options={[
								"DIRINFRA", "GAC INFRA-AN", "GECAMP", "CEPE", "COMARA", "SERINFRA-BE",
								"SERINFRA-BR", "SERINFRA-CO", "SERINFRA-MN", "SERINFRA-NT", "SERINFRA-RJ",
								"SERINFRA-SJ", "DACO MN", "Nenhuma das opções anteriores"
							]}
							erros={errors}
							placeholder='Elo 2 responsável pelo ID PLANINFRA'
							watch={watch}
						/>
					</div> */}
					<div>
						<DirinfraInput
							name='valor'
							erros={errors}
							label="Valor da Solução"
							placeholder='Insira o valor estimado da solução, em R$'
							registro={register}
							required={false}
						/>
					</div>
					<div className='linha'>
						<DirinfraInput
							// orientacao="column"
							name='data_estimada_entrega_proj'
							erros={errors}
							label='Data Estimada de Entrega do Projeto'
							placeholder='DD/MM/AAAA'
							registro={register}
							//required={true}
							type='date'
							required={true}
						/>
					</div>
					<div className='linha'>
						<DirinfraInput
							// orientacao="column"
							name='doc_sigadaer_entrega_proj'
							erros={errors}
							label='Documento SIGADAER da Entrega do Projeto'
							placeholder='Ofício nºXXX/YYYYY/ZZZZ'
							registro={register}
							required={false}
						//required={false}
						/>
					</div>
					<div className='linha'>
						<DirinfraInput
							// orientacao="column"
							name='data_sigadaer_proj'
							erros={errors}
							label='Data do documento do SIGADAER'
							placeholder='DD/MM/AAAA'
							registro={register}
							required={false}
							type='date'
						/>
					</div>
					<div className='linha'>
						<DirinfraTextArea
							name='obs_etpe'
							erros={errors}
							label='Observações'
							placeholder='Digite aqui as informações relevantes sobre esse PLANINFRA que não foram destacadas nos campos anteriores.'
							registro={register}
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

export default PLANINFRAForm;