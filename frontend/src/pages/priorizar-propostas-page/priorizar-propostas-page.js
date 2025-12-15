import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';
import { toast } from 'react-toastify';

import { useLocation, useParams, useNavigate } from "react-router-dom";

import Loading from '../../components/Loader/Loading';


import DirinfraSelect from '../../components/DirinfraSelect/DirinfraSelect';
import utilService from '../../services/utilService';



const useStyles = makeStyles(theme => ({
	content: {
		backgroundColor: 'var(--color-bg1)',
		minHeight: 'calc(100vh - var(--topbar-height) - 170px)',
		padding: '0 10px 10px'
	},
	contentEscolha: {
		display: 'flex',
		flexDirection: 'row',
		gap: '20px',
		justifyContent: 'center',
		marginTop: '20px',
		padding: '10px',
	},
	colecaoEscolha: {
		alignItems: 'center',
		border: '1px solid var(--color-borderdefault)',
		borderRadius: '4px',
		boxShadow: '0 0 8px 0px var(--color-shadow)',
		cursor: 'pointer',
		display: 'flex',
		height: '400px',
		justifyContent: 'center',
		width: '40%',

		'&:hover': {
			backgroundColor: 'var(--color-hover)',
			boxShadow: '0 0 8px 1px var(--color-shadow)',
			color: 'var(--color-font4light)'
		},

		'& > label': {
			fontSize: '30px',
			textAlign: 'center'
		}
	},
	marginTop: {
		marginTop: '40px'
	}
}));

const PriorizarPropostas = () => {

	const { register, handleSubmit, formState: { errors, isDirty }, reset, watch, setValue } = useForm();

	const [ods, setOds] = useState([]);

	// useEffect para mapear a lista de oms e ods do banco
	useEffect(() => {
		//console.log("Mapear lista oms")
		const fetchODSs = async () => {
			try {
				//const listaOMs = await utilService.obterOMs();
				const listaODS = await utilService.obterODS();
				//const listaEstados = await utilService.obterEstados();
				//setOms(listaOMs.data);
				setOds(listaODS.data);
				//setEstados(listaEstados.data);

			} catch (error) {
				toast.error("Erro ao carregar ODS");
			}
		};

		fetchODSs();
	}, []);

	//Render para formulário genérico e edições
	return (
		<><div>
			<div className='linha'>
				<DirinfraSelect
					// orientacao="column"
					name='ods_objeto'
					erros={errors}
					label='Selecione um ODS'
					placeholder='ODS do Objeto'
					registro={register}
					required={true}
					watch={watch}
					options={ods.map(ods => ({ value: ods, label: ods }))}
				/>
			</div>

			


			
		</div>
		</>
	);
};

export default PriorizarPropostas;