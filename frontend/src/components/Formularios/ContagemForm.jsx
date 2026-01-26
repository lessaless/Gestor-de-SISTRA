import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import DirinfraInput from '../DirinfraInput/DirinfraInput';

const useStyles = makeStyles({
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
    width: '65%',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: '8px',
  },
  inputWrapper: { width: '100%' },
  buttonsContainer: { display: 'flex', gap: '5px', flexShrink: 0 },
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
    '&:active': { transform: 'scale(0.98)' },
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
  disabled,
  disableButtons = false,
  ...props
}) => {
  const classes = useStyles();

  const valorAtual = watch(name);
  const [valorExibido, setValorExibido] = useState('');

  // Keep display in sync with RHF value
  useEffect(() => {
    if (valorAtual !== undefined && valorAtual !== null && valorAtual !== '') {
      setValorExibido(`${valorAtual} dias`);
    } else {
      setValorExibido('');
    }
  }, [valorAtual]);

  // If disabled, clear the real value so it won't fail required
  useEffect(() => {
    if (disabled) {
      setValue(name, '', { shouldValidate: true, shouldDirty: true });
      setValorExibido('');
    }
  }, [disabled, name, setValue]);

  const handleChange = (event) => {
    const apenasNumeros = event.target.value.replace(/\D/g, '');
    setValorExibido(apenasNumeros ? `${apenasNumeros} dias` : '');

    // ✅ IMPORTANT: update the REAL RHF field immediately
    const valor = apenasNumeros ? parseInt(apenasNumeros, 10) : '';
    setValue(name, valor, { shouldValidate: true, shouldDirty: true });

    if (props.onChange) props.onChange(event);
  };

  const handleBlur = () => {
    const apenasNumeros = valorExibido.replace(/\D/g, '');
    let valor = apenasNumeros ? parseInt(apenasNumeros, 10) : '';

    if (valor !== '') {
      if (valor < min) valor = min;
      if (valor > max) valor = max;
    }

    setValue(name, valor, { shouldValidate: true, shouldDirty: true });
    setValorExibido(valor !== '' ? `${valor} dias` : '');
  };

  const handleIncrement = () => {
    const base =
      valorAtual !== undefined && valorAtual !== null && valorAtual !== ''
        ? parseInt(valorAtual, 10)
        : min;

    const novoValor = Math.min(base + step, max);
    setValue(name, novoValor, { shouldValidate: true, shouldDirty: true });
  };

  const handleDecrement = () => {
    const base =
      valorAtual !== undefined && valorAtual !== null && valorAtual !== ''
        ? parseInt(valorAtual, 10)
        : min;

    const novoValor = Math.max(base - step, min);
    setValue(name, novoValor, { shouldValidate: true, shouldDirty: true });
  };

  const isAtMax = valorAtual >= max;
  const isAtMin = valorAtual <= min;

  return (
    <div className={classes.row}>
      <label className={classes.labelDirinfra}>{label || name}</label>

      <div className={classes.fieldArea}>
        <div className={classes.inputWrapper}>
          {/* ✅ Register the REAL field for validation */}
          <input
            type="hidden"
            {...register(name, {
              required: required ? 'Os campos em vermelho são obrigatórios.' : false,
            })}
          />

          {/* ✅ Display-only input (NOT registered in RHF) */}
          <DirinfraInput
            hideLabel
            label=""
            name={`${name}__display`}   // just a dummy name
            value={valorExibido}
            placeholder={placeholder || 'Digite o número de dias'}
            erros={errors}              // errors still come from REAL name (depends on your DirinfraInput impl)
            required={required}
            onChange={handleChange}
            onBlur={handleBlur}
            inputMode="numeric"
            disabled={disabled}
            {...props}
          />
        </div>

        <div className={classes.buttonsContainer}>
          <button
            type="button"
            className={classes.sideButton}
            onClick={handleDecrement}
            disabled={disabled || disableButtons || isAtMin}
            title="Diminuir"
          >
            −
          </button>

          <button
            type="button"
            className={classes.sideButton}
            onClick={handleIncrement}
            disabled={disabled || disableButtons || isAtMax}
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
