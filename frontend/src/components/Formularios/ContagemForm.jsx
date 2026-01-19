import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import DirinfraInput from '../DirinfraInput/DirinfraInput';

const useStyles = makeStyles({
	// ✅ Outer row matches DirinfraTextarea layout: [30% label] [65% field area]
	row: {
		alignItems: 'center',
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'nowrap',
		justifyContent: 'center',
		gap: '5px',
		width: '100%',
	},

	labelDirinfra: {
		alignItems: 'center',
		color: 'var(--color-font4light)',
		display: 'flex',
		fontSize: '.95rem',
		fontWeight: '450',
		justifyContent: 'start',
		padding: '5px',
		width: '30%',
		flexShrink: 0,
	},


	fieldArea: {
		width: '65%',                 // SAME as textarea
		display: 'grid',
		gridTemplateColumns: '1fr auto', // ✅ input column + button column
		alignItems: 'center',
		gap: '8px',
	},



	inputWrapper: {
		width: '100%',
	},

	buttonsContainer: {
		display: 'flex',
		gap: '5px',
		flexShrink: 0,
	},

	sideButton: {
		width: '40px',
		height: '40px',
		minWidth: '40px',
		minHeight: '40px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'var(--color-bg1)',
		border: '1px solid var(--color-borderdefault)',
		borderRadius: '5px',
		cursor: 'pointer',
		fontSize: '1.2rem',
		fontWeight: 'bold',
		color: 'var(--color-font4light)',
		transition: 'all 200ms ease',
		userSelect: 'none',
		boxShadow: '0 0 8px 0px var(--color-shadow)',

		'&:hover': {
			backgroundColor: 'var(--color-borderfocus)',
			borderColor: 'var(--color-borderfocus)',
			color: '#fff',
			transform: 'scale(1.05)',
		},

		'&:active': {
			transform: 'scale(0.98)',
		},

		'&:disabled': {
			backgroundColor: 'var(--color-disabled)',
			cursor: 'not-allowed',
			opacity: 0.6,
			transform: 'none',
		},
	},
});

const DirinfraInputNumerico = ({
	register,
	errors,
	name,
	label,
	placeholder,
	required,
	setValue,
	watch,
	min = 0,
	max = 9999,
	step = 1,
	...props
}) => {
	const classes = useStyles();
	const valorAtual = watch(name);
	const [valorExibido, setValorExibido] = useState('');

	useEffect(() => {
		if (valorAtual !== undefined && valorAtual !== null && valorAtual !== '') {
			setValorExibido(`${valorAtual}`);
		} else {
			setValorExibido('');
		}
	}, [valorAtual]);

	const handleChange = (event) => {
		const apenasNumeros = event.target.value.replace(/\D/g, '');
		setValorExibido(apenasNumeros ? `${apenasNumeros}` : '');

		if (props.onChange) props.onChange(event);
	};

	const handleBlur = () => {
		const apenasNumeros = valorExibido.replace(/\D/g, '');
		let valor = apenasNumeros ? parseInt(apenasNumeros, 10) : min;

		if (valor < min) valor = min;
		if (valor > max) valor = max;

		setValue(name, valor);
		setValorExibido(valor !== '' ? `${valor}` : '');
	};

	const handleIncrement = () => {
		const valorNumerico =
			valorAtual !== undefined && valorAtual !== null && valorAtual !== ''
				? parseInt(valorAtual, 10)
				: min;

		const novoValor = Math.min(valorNumerico + step, max);
		setValue(name, novoValor);
	};

	const handleDecrement = () => {
		const valorNumerico =
			valorAtual !== undefined && valorAtual !== null && valorAtual !== ''
				? parseInt(valorAtual, 10)
				: min;

		const novoValor = Math.max(valorNumerico - step, min);
		setValue(name, novoValor);
	};

	const isAtMax = valorAtual >= max;
	const isAtMin = valorAtual <= min;

	return (
		<div className={classes.row}>
			{/* ✅ Left column label (30%) */}
			<label className={classes.labelDirinfra}>
				{label || name}
			</label>

			{/* ✅ Right column (65%): input + buttons */}
			<div className={classes.fieldArea}>
				<div className={classes.inputWrapper}>
					<DirinfraInput
						hideLabel                 // ✅ IMPORTANT
						label=""                  // optional
						name={`${name}_exibido`}
						registro={register}
						value={valorExibido}
						placeholder={placeholder || 'Digite o número de dias'}
						erros={errors}
						required={required}
						onChange={handleChange}
						onBlur={handleBlur}
						inputMode="numeric"
						{...props}
					/>

				</div>

				<div className={classes.buttonsContainer}>
					<button
						type="button"
						className={classes.sideButton}
						onClick={handleDecrement}
						disabled={isAtMin}
						title="Diminuir"
					>
						−
					</button>

					<button
						type="button"
						className={classes.sideButton}
						onClick={handleIncrement}
						disabled={isAtMax}
						title="Aumentar"
					>
						+
					</button>
				</div>
			</div>
		</div>
	);
};

export default DirinfraInputNumerico;
