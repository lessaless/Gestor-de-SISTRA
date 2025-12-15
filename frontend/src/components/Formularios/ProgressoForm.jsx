import React, { useState, useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import DirinfraInput from '../DirinfraInput/DirinfraInput';
import utilService from '../../services/utilService';
import DirinfraListSelect from '../DirinfraSelect/DirinfraListSelect';
import Dicionario from '../../utils/Dicionario';


const buscarEfetivo = async () => {
	try {
		const efetivo = await utilService.obterEfetivo();
		const mapaEfetivo = efetivo.data.reduce((acc, item) => {
			// Converte o POSTO para maiúsculas
			let posto = item.POSTO?.toUpperCase();
			// Converte o NOME para iniciais maiúsculas e o restante minúsculo
			let nome = item.NOME
				?.toLowerCase()
				.split(' ')
				.map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
				.join(' ');

			acc[item.SARAM] = `${posto} ${nome}`;
			return acc;
		}, {});

		
		return mapaEfetivo;

	} catch (error) {
		console.error('Erro ao obter a lista do Efetivo:', error);

	}
};

/////////////////////////////////////////////////////////////////////////////////////
const ProgressoForm = ({ register, errors, control, setValue, watch }) => {

	const { fields, append, remove } = useFieldArray({
		control,
		name: "autores",
	});

	const [responsaveis, setResponsaveis] = useState([]);


	const valoresAutores = watch("autores", fields); // Observa as mudanças nos campos de autores

	useEffect(() => {
		const atualizarNomesAutores = async () => {
			try {
				// Busca o efetivo
				const mapaEfetivo = await buscarEfetivo();
				// Percorre os autores
				valoresAutores.forEach((autor, index) => {
					// console.log(autor)
					if (autor.SARAM && mapaEfetivo[autor.SARAM]) {
						// console.warn(mapaEfetivo[autor.SARAM]);
						// Define o valor do campo displayPessoa
						setValue(`autores.${index}.displayPessoa`, mapaEfetivo[autor.SARAM]);
					}
				});
			} catch (error) {
				console.error('Erro ao atualizar nomes dos autores:', error);
			}
		};

		// Chama a função ao inicializar ou quando `valoresAutores` muda
		atualizarNomesAutores();
	}, [valoresAutores, setValue]);



	const handleAddAutor = () => {
		append({ SARAM: '', especialidade: '', tempo_gasto: '', displayPessoa: '' });
	};

	const handleRemoveAutor = (index) => {
		remove(index);
	};

	const handleSelectChange = (index, value) => {
		const selectedOption = responsaveis.find(responsavel => responsavel.label === value);
		if (selectedOption) {
			setValue(`autores.${index}.SARAM`, selectedOption.SARAM);
			setValue(`autores.${index}.displayPessoa`, selectedOption.label);

		} else {
			setValue(`autores.${index}.SARAM`, '');
			setValue(`autores.${index}.displayPessoa`, value);
		}
	};


	useEffect(() => {
		const fetchResponsaveis = async () => {
			try {
				const efetivo = await utilService.obterEfetivo();
				const options = efetivo.data.map(item => ({
					label: `${item.POSTO} ${item.NOME} - ${item.OM}`,
					value: `${item.POSTO} ${item.NOME} - ${item.OM}`,
					SARAM: item.SARAM
				}));
				
				setResponsaveis(options);
			} catch (error) {
				console.error('Erro ao obter a lista do Efetivo:', error);
			}
		};

		fetchResponsaveis();
	}, []);


	return (
		<div className='linha'>
			<em className="obrigatorios">*</em>
			<div style={{ border: '1px solid', borderColor: 'var(--color-borderdefault)', borderRadius: '4px', margin: '0 10px', padding: '2px', width: '100%' }}>
				{fields.map((field, index) => (
					<div key={index} className='coluna' style={{ marginTop: '20px', rowGap: '5px' }}>
						{/* <DirinfraInput
						label={`Responsável ${index + 1}`}
						type="text"
						name={`autores.${index}.displayPessoa`}
						registro={register}
						defaultValue={field.displayPessoa}
						onChange={(e) => handleSelectChange(index, e.target.value)}
						placeholder='Selecione um responsável técnico pelo ETPE'
						erros={errors}
						list='datalistOpcoes'
						opcoesDataList={responsaveis}
					/> */}

						<DirinfraListSelect
							name={`autores.${index}.displayPessoa`}
							label={`Atualizador ${index + 1}`}
							registro={register}
							defaultValue={field.displayPessoa}
							placeholder='Selecione um responsável'
							required={true}
							erros={errors}
							setValue={setValue} //Obrigatório para o componente DirinfraListSelect
							onChange={(e) => handleSelectChange(index, e.target.value)}
							watch={watch}
							options={responsaveis}
						/>

						<DirinfraInput
							label='SARAM'
							name={`autores.${index}.SARAM`}
							type="number"
							registro={register}
							/* disabled */
							/* value={field.SARAM} */
							erros={errors}
							required={true}
						/>

						{/* <DirinfraSelect
						label="Especialidade"
						name={`autores.${index}.especialidade`}
						registro={register}
						defaultValue={field.especialidade}
						placeholder='Selecione a disciplina em que esse profissional atuou'
						options={[
							"DIRINFRA", "GAC INFRA-AN", "GECAMP", "CEPE", "COMARA", "SERINFRA-BE",
							"SERINFRA-BR", "SERINFRA-CO", "SERINFRA-MN", "SERINFRA-NT", "SERINFRA-RJ",
							"SERINFRA-SJ", "DACO MN", "Nenhuma das opções anteriores"
						]}
						erros={errors}
					/> */}
						<DirinfraInput
							label={Dicionario('progresso')}
							type="number"
							name={`autores.${index}.progresso`}
							registro={register}
							defaultValue={field.progresso}
							placeholder='Estimativa do progresso, em porcentagem'
							erros={errors}
						//validar={(event) => Number.isInteger(Number(event.target.value)) || "Tempo deve ser registrado em quantidade de horas inteiras"}
						/>
						<button className='deletar' type="button" style={{ maxWidth: '120px', margin: '5px 2.0% 20px auto' }} onClick={() => handleRemoveAutor(index)}>Remover</button>
					</div>
				))}
				<button className='novo' type="button" style={{ minWidth: '180px', margin: '10px 0px 10px 2.5%' }} onClick={handleAddAutor}>Adicionar Responsável</button>
			</div>
		</div>
	);
};

export default ProgressoForm;
