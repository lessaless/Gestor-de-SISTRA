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
        minHeight: '100px',
        /* minWidth: '600px', */
        display: 'flex',
        justifyContent: 'start',
        alignItems: 'center',
        backgroundColor: 'var(--color-bg1)',
        borderRadius: '5px',
        border: 'solid 1px',
        color: 'var(--color-font4light)',
        padding: '5px',
        fontSize: '.9rem',
        fontWeight: '500',
        transition: 'all 500ms ease',

        '&:focus, &:focus-visible': {
            outline: 'none !important',//retira padrão do navegador
            borderColor: 'var(--color-borderfocus)',
        },

        '&::placeholder': {
            fontStyle: 'italic',
            color: 'var(--color-placeholder)'
        },

        '&:disabled': {
            backgroundColor: 'var(--color-disabled)'
        }
    },
    inputDirinfraOk: {
        borderColor: 'var(--color-borderdefault)',
        '&:focus, &:focus-visible': {
            borderColor: 'var(--color-borderfocus)'
        }
    },
    inputDirinfraErro: {
        borderColor: 'var(--color-borderError)',
        '&:focus, &:focus-visible': {
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

const DirinfraTextArea = ({ registro, erros, ...props }) => {
    const classes = useStyles();
    const temErro = erros && erros[props.name];
    const persistirDisabled = true;//desabilita o clique-duplo-para-reabilitar elementos com disabled
    const registroProps = registro && registro(props.name,
        {
            required: props.required,
            pattern: props.pattern,
            minLength: props.minLength,
            maxLength: props.maxLength,
            validate: props.validar
        });


    return (
        <div className={classes.main} onDoubleClick={(e) => {
            if (persistirDisabled) return;
            e.currentTarget.lastElementChild.disabled = false;
            e.currentTarget.lastElementChild.style.pointerEvents = 'auto';
        }}>
            {/* {props.required && (<em className="obrigatorios">*</em>)} */}
            <label
                className={classes.labelDirinfra}
                style={{ width: '30%' }}
            >
                {props.label || props.name}
                {props.required && (
                        <span className={classes.requiredAsterisk}>*</span>
                    )}
            </label>
            <textarea
                className={`${classes.inputDirinfra} ${temErro ? classes.inputDirinfraErro : classes.inputDirinfraOk} ${props.className}`}
                style={{
                    pointerEvents: `${props.disabled ? 'none' : 'auto'}`,
                    userSelect: `${props.disabled ? 'none' : 'auto'}`,
                    width: props.l ? `${props.l}px` : '65%',  // Aplica a largura se 'l' estiver presente
                }}
                {...registroProps}
                {...props}
            />
        </div>
    );
};

export default DirinfraTextArea;