// DirinfraInput.jsx (updated: supports `addon` prop + errorName/registerName)
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    main: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '5px',
        width: '100%'
    },

    inputDirinfra: {
        minHeight: '15px',
        backgroundColor: 'var(--color-bg1)',
        borderRadius: '5px',
        border: 'solid 1px',
        color: 'var(--color-font4light)',
        padding: '5px',
        fontSize: '.9rem',
        fontWeight: '500',
        transition: 'all 500ms ease',
        whiteSpace: 'normal',
        wordBreak: 'break-word',

        '&:focus, &:focus-visible': {
            outline: 'none !important',
            borderColor: 'var(--color-borderfocus)',
        },

        '&::placeholder': {
            fontStyle: 'italic',
            color: 'var(--color-placeholder)',
            textAlign: 'left',
            whiteSpace: 'normal',
            flexWrap: 'wrap',
            wordBreak: 'break-word',
        },

        '&:disabled': {
            backgroundColor: 'var(--color-disabled) !important',
            cursor: 'not-allowed'
        }
    },
    inputDirinfraOk: {
        borderColor: 'var(--color-borderdefault)',
        '&:focus, &:focus-visible': {
            borderColor: 'var(--color-borderfocus)'
        },

        '&:disabled': {
            backgroundColor: 'var(--color-disabled) !important'
        }
    },
    inputDirinfraErro: {
        borderColor: 'var(--color-borderError)',
        '&:focus, &: focus- visible': {
            borderColor: 'var(--color-borderError)'
        }
    },

    labelDirinfra: {
        alignItems: 'center',
        color: 'var(--color-font4light)',
        // display: 'flex',
        fontSize: '.95rem',
        fontWeight: '450',
        justifyContent: 'start',
        minHeight: '15px',
        minWidth: 'min-content',
        padding: '5px',
    },
    requiredAsterisk: {
        color: 'var(--color-borderError, red)',
        marginLeft: '4px',
        fontWeight: 'bold',
    },
});

const buscarErro = (objErros, propsName) => {
    return objErros[propsName] || propsName
        .split('.')
        .reduce((acc, part) => acc && acc[part], objErros);
};

const DirinfraInput = ({
    registro,
    erros,
    orientacao,
    opcoesDataList,
    labelProps,
    validar,
    inverterValores,
    addon = null,
    hideLabel = false,

    // ✅ NEW:
    errorName,     // use this key to find errors (instead of props.name)
    registerName,  // use this key to register the field (instead of props.name)

    ...props
}) => {
    const classes = useStyles({ orientacao });

    const persistirDisabled = true; // disables double-click re-enable

    // ✅ choose which name to use for validation & error lookup
    const nomeParaRegistrar = registerName || props.name;
    const nomeParaErro = errorName || props.name;

    const temErro = erros && buscarErro(erros, nomeParaErro);

    const registroProps = registro && registro(nomeParaRegistrar,
        {
            required: props.required,
            pattern: props.pattern,
            minLength: props.minLength,
            maxLength: props.maxLength,
            validate: validar
        });

    const handleBlur = async (event) => {
        if (props.onBlur) {
            await props.onBlur(event);
        }
        if (registroProps && registroProps.onBlur) {
            await registroProps.onBlur(event);
        }
    };

    const handleInput = async (event) => {
        if (props.onInput) await props.onInput(event);
        if (registroProps && registroProps.onInput) await registroProps.onInput(event);

        if (props.type === 'number') {
            event.target.value = event.target.value.replace(/[^0-9]/g, '');
        }
    };

    const opcoesFormatadas = opcoesDataList && opcoesDataList.map(opcao =>
        typeof opcao === 'string'
            ? { label: opcao, value: opcao }
            : opcao
    );

    const labelWidth = hideLabel ? '0px' : (props.labelWidth || '30%');
    const inputContainerWidth = hideLabel ? '100%' : (props.l ? `${props.l}px` : '65%');

    return (
        <div className={classes.main} onDoubleClick={(e) => {
            if (persistirDisabled) return;
            e.currentTarget.lastElementChild.disabled = false;
            e.currentTarget.lastElementChild.style.pointerEvents = 'auto';
        }}>
            {!hideLabel && (
                <label
                    className={classes.labelDirinfra}
                    style={{ width: labelWidth }}
                    {...labelProps}
                >
                    {props.label || props.name}
                    {/* Asterisco vermelho para campos obrigatórios */}
                    {props.required && (
                        <span className={classes.requiredAsterisk}>*</span>
                    )}
                </label>
            )}

            {opcoesDataList && (
                <datalist id={props.name}>
                    {opcoesFormatadas.map((opcao, index) => (
                        <option value={inverterValores ? opcao.label : opcao.value} key={index}>
                            {inverterValores ? opcao.value : opcao.label}
                        </option>
                    ))}
                </datalist>
            )}

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: inputContainerWidth,
                boxSizing: 'border-box'
            }}>
                <input
                    className={`${classes.inputDirinfra} ${temErro ? classes.inputDirinfraErro : classes.inputDirinfraOk} ${props.className || ''}`}
                    style={{
                        pointerEvents: `${props.disabled ? 'none' : 'auto'}`,
                        userSelect: `${props.disabled ? 'none' : 'auto'}`,
                        width: '100%',
                        height: props.a ? `${props.a}px` : '30px',
                    }}
                    list={props.name}
                    {...(registroProps || {})}
                    {...props}
                    onWheel={(e) => {
                        if (props.type === "number") {
                            e.target.blur();
                        }
                        if (props.onWheel) props.onWheel(e);
                    }}
                    onBlur={handleBlur}
                    onInput={handleInput}
                />

                {addon && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {addon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirinfraInput;
