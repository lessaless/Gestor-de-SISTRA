import React, { useState, useEffect } from 'react';
import { useFieldArray } from 'react-hook-form';
import DirinfraInput from '../DirinfraInput/DirinfraInput';

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

/////////////////////////////////////////////////////////////////////////////////////////////////
const SolucaoForm = ({ register, errors, control, setValue, watch }) => {


	const { fields, append, remove } = useFieldArray({
		control,
		name: "solucoes",
	});

	const valoresSolucoes = watch("solucoes", fields); // Observa as mudanças nos campos de solucoes

	const [valoresFormatados, setValoresFormatados] = useState(fields.map(() => ''));

	useEffect(() => {
		// Atualiza os valores formatados ao resetar o formulário com novos dados
		setValoresFormatados(valoresSolucoes.map((solucao) =>
			solucao.valor_solucao ? formatarMoeda(solucao.valor_solucao) : ''
		));
	}, [valoresSolucoes]);

	const handleAddSolucao = () => {
		append({ nume_solucao: fields.length + 1, valor_solucao: '', tempo_projeto_solucao: '', tempo_obra_solucao: '' });
		setValoresFormatados((prev) => [...prev, '']);
	};

	const handleRemoveSolucao = (index) => {
		remove(index);
		setValoresFormatados((prev) => prev.filter((_, i) => i !== index));
	};

	const handleValorChange = (index, event) => {
		const inputValue = event.target.value;
		setValoresFormatados(prevState => {
			const newState = [...prevState];
			newState[index] = inputValue;
			return newState;
		});
	};

	const handleBlur = (index) => {
		const valorNumerico = desformatarMoeda(valoresFormatados[index]);
		const valorFormatado = formatarMoeda(valorNumerico);
		setValue(`solucoes.${index}.valor_solucao`, valorNumerico);
		setValoresFormatados(prevState => {
			const newState = [...prevState];
			newState[index] = valorFormatado;
			return newState;
		});
	};




	return (
		<div className='linha'>
			<em className="obrigatorios">*</em>
			<div style={{ border: '1px solid', borderColor: 'var(--color-borderdefault)', borderRadius: '4px', margin: '0 10px', padding: '2px', width: '100%' }}>
				{fields.map((field, index) => (
					<React.Fragment key={field.id}>
						{index > 0 && (
							<hr
								style={{
									border: "none",
									height: "1px",
									background: "linear-gradient(to right, transparent, var(--color-borderdefault), transparent)",
									margin: "10px 20px 30px"
								}}
							/>
						)}

						<div key={field.id} className='coluna' style={{ marginTop: '20px', rowGap: '5px' }}>
							<DirinfraInput
								label={`Número da Solução`}
								type='number'
								name={`solucoes.${index}.nume_solucao`}
								registro={register}
								value={index + 1} // Número da solução gerado automaticamente
								erros={errors}
								required={true}
							/>
							<DirinfraInput
								label="Valor da Solução"
								type="text"
								name={`solucoes.${index}.valorFormatado`}//name usado só para exibição, o campo a salvar fica no setValue de onBlur
								registro={register}
								value={valoresFormatados[index]}
								placeholder='Insira o valor estimado da solução'
								erros={errors}
								required={false}
								onChange={(e) => handleValorChange(index, e)}
								onBlur={() => handleBlur(index)} // Formata ao perder o foco
							/>
							<DirinfraInput
								label="Tempo de Projeto (meses)"
								type="number"
								name={`solucoes.${index}.tempo_projeto_solucao`}
								registro={register}
								defaultValue={field.tempo_projeto_solucao}
								placeholder='Estimativa do tempo de projeto para essa solução (em horas)'
								erros={errors}
								required={true}
							/>
							<DirinfraInput
								label="Tempo de Obra (meses)"
								type="number"
								name={`solucoes.${index}.tempo_obra_solucao`}
								registro={register}
								defaultValue={field.tempo_obra_solucao}
								placeholder='Estimativa do tempo de obra para essa solução (em horas)'
								erros={errors}
								required={true}
							/>
							<button className='deletar' type="button" style={{ marginBottom: '20px', maxWidth: '120px', margin: '5px 2.0% 20px auto' }} onClick={() => handleRemoveSolucao(index)}>Remover</button>
						</div>
					</React.Fragment>
				))}
				<button
					type="button"
					style={{ minWidth: '180px', margin: '10px 0px 10px 2.5%' }}
					onClick={handleAddSolucao}
					className='novo'
				>
					Adicionar Solução
				</button>
			</div>
		</div>
	);
};

export default SolucaoForm;