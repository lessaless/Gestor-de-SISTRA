import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';

import GerenciadorDeArquivo from '../../GerenciadorDeArquivo/GerenciadorDeArquivo';
import AutorForm from '../AutorForms';
import SolucaoForm from '../SolucaoForm';

import demandaService from '../../../services/demandaService';
import cnService from '../../../services/cnService';

import DirinfraInput from '../../DirinfraInput/DirinfraInput';
import DirinfraSelect from '../../DirinfraSelect/DirinfraSelect';
import DirinfraTextArea from '../../DirinfraTextArea/DirinfraTextArea';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Dicionario from '../../../utils/Dicionario';
import DisciplinasForm from '../DisciplinasForm';
import PalavrasChaveForm from '../PalavrasChaveForm';
// import SolucaoForm from '../SolucaoForm';


import {
    listarDados,
    onError,
    onSubmit,
    receberArquivo,
    redirecionar
} from '../../../utils/gerCrud';


const ETPEForm = () => {

	const { register, handleSubmit, formState: { errors, isDirty }, reset, control, setValue, watch } = useForm();

	const { id } = useParams();//se for para editar, pega id na url
	const navigate = useNavigate();
    const pagina = id ? 'Editar' : 'Criar';
    const colecao = 'etpes';

	const [arquivo, setArquivo] = useState(null);
	const [arquivoAlterado, setArquivoAlterado] = useState(false);
	const [temErroArquivo, setTemErroArquivo] = useState(false);
	const [demandas, setDemandas] = useState([]);
	const [idDemanda, setIdDemanda] = useState('');
	const [cns, setCNs] = useState([]);

	const [btnNovaDemanda, setBtnNovaDemanda] = useState(false);

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
		//console.log("Dados enviados nafunção aoEnviar", data)
		const listaChaves = Object.keys(data);
		//console.warn(listaChaves)
		data.colecao = colecao;
		data.arquivo = arquivo;

		try {
			if (data.autores.length === 0) throw new Error("É necessário ter pelo menos um autor!");
			if (data.solucoes.length === 0) throw new Error("É necessário ter pelo menos uma solução!");
			if (!arquivo) {
				setTemErroArquivo(true)
				throw new Error("É necessário realizar upload do ETPE")
			}
			
			const resp = await onSubmit(data, pagina, listaChaves);
			toast.success(resp.message);
			
			if (window.opener) {//opener é a janela que abriu este componente como popup
                window.opener.atualizarPagina();//executa a função global no opener (atualizarPagina está no App.jsx)
                setTimeout(() => {
                    window.close();//fecha o componente atual após um tempo para o toast ser exibido
                }, 1500);

            } else navigate(`/main/confirmacaoetpe?id_etpe=${resp.obj.id_etpe}`);
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

	//Função para atualizar o estado de id_demanda quando algo for selecionado no select
	const handleIdDemandaChange = (event) => {
		const escolha = event.target.value;
		const novaEscolha = escolha === 'Não se aplica';
		if (btnNovaDemanda !== novaEscolha) {
			setBtnNovaDemanda(novaEscolha);
		}


		setIdDemanda(event.target.value);
	};


	// useEffect para mapear a lista de demandas do banco
	useEffect(() => {
		const fetchDemandas = async () => {
			try {
				const listaDemandas = await demandaService.lerDemandas();
				const opcaoNovaDemanda = [
					{ apelido_demanda: '', id_demanda: 'Não se aplica' },
					...listaDemandas.data
				];
				setDemandas(opcaoNovaDemanda);
			} catch (error) {
				toast.error("Erro ao carregar a lista de demandas");
			}
		};

		fetchDemandas();
	}, []);

	// useEffect para mapear a lista de cns do banco
	useEffect(() => {
		const fetchCNs = async () => {
			try {
				const listaCNs = await cnService.lerCNs(idDemanda ? idDemanda : undefined);
				//console.log(listaCNs)
				setCNs(listaCNs.data);
			} catch (error) {
				toast.error("Erro ao carregar a lista de CNs");
			}
		};
		fetchCNs();
	}, [idDemanda]);


	return (
		<>
			<div className='formulario-titulo'>
				<h3>Formulário: Estudo Técnico Preliminar de Engenharia</h3>
			</div>

			<div className='formulario-main'>
				<div className='formulario-content'>
					<div className='linha'>
						<DirinfraSelect
							label='Demanda'
							name='id_demanda'
							registro={register}
							//required={true}
							options={demandas.map(demanda => ({
								value: demanda.id_demanda,
								label: `${demanda.id_demanda} ${demanda.apelido_demanda || ''}`
							}))}
							erros={errors}
							placeholder='Selecione a demanda a qual esse ETPE está associado'
							onChange={handleIdDemandaChange}
							required={true}
							watch={watch}
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
								value: cn.id_cn,
								label: `${cn.id_cn}`
							}))}
							erros={errors}
							placeholder='Selecione o CN a qual esse ETPE está associado'
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
							label='Documento SIGADAER do ETPE'
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
							]}
							erros={errors}
							placeholder='Elo responsável por produzir o ETPE'
							watch={watch}
						/>
					</div>

					{/* <div className='linha'>
						<DirinfraSelect
							label='Autores'
							name='autores'
							registro={register}
							required={true}
							options={[
								"opções"
							]}
							erros={errors}
							placeholder='Autores do ETPE'
						/>
					</div> */}

					{/* <div className='linha'>
						<label>Autores</label>
					</div> */}
					{/* <div className='linha'>
						<AutorForm register={register} errors={errors} />
					</div> */}
					{/* <br />
					<br />
					<br />
					<br /> */}
					<AutorForm register={register} errors={errors} control={control} setValue={setValue} watch={watch} />
					<SolucaoForm register={register} errors={errors} control={control} setValue={setValue} watch={watch} />
					
					{/* <div className="linha" style={{ marginTop: '0', display: 'flex', justifyContent: 'flex-end' }}>
						<button
							style={{ width: '25%', margin: '0 10px' }}
							onClick={() => window.location.href = '/main/home/cadastrar/demandas'}
						>
							Registrar novo usuário
						</button>
					</div> */}

					<div className='linha'>
						<DirinfraTextArea
							name='obs_etpe'
							erros={errors}
							label='Observações'
							placeholder='Digite aqui as informações relevantes sobre esse ETPE que não foram destacadas nos campos anteriores.'
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
					<GerenciadorDeArquivo arquivo={arquivo} setArquivo={setArquivo} atualizarIsDirty={atualizarIsDirty} temErroArquivo={temErroArquivo} setTemErroArquivo={setTemErroArquivo}/>
				</div>
			</div>
		</>
	);
};

export default ETPEForm;