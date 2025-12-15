import React, { useEffect, useState } from 'react';
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
    selectDirinfra: {
        display: 'flex',
        backgroundColor: 'var(--color-bg1)',
        borderRadius: '5px',
        border: 'solid 1px',
        color: 'var(--color-font4light)',
        padding: '5px',
        fontSize: '.9rem',
        fontWeight: '500',
        /* transition: 'all 500ms ease', */

        '&:focus, &:focus-visible': {
            outline: 'none !important',
            borderColor: 'var(--color-borderfocus)',
        }, 
        '&:disabled': {
            backgroundColor:'var(--color-disabled)'
          
        }
    },
    selectPlaceholder: {
        fontStyle: 'italic',
        color: 'var(--color-placeholder)',
        '& option': {
            color: 'var(--color-font4light)',
            fontStyle: 'normal'
        }
    },
    selectDirinfraOk: {
        borderColor: 'var(--color-borderdefault)',
        '&:focus, &:focus-visible': {
            borderColor: 'var(--color-borderfocus)'
        }
    },
    selectDirinfraErro: {
        borderColor: 'var(--color-borderError)',
        '&:focus, &:focus-visible': {
            borderColor: 'var(--color-borderError)'
        }
    },

    labelDirinfra: {
        alignItems: 'center',
        color: 'var(--color-font4light)',
        display: 'flex',
        fontSize: '.95rem',
        fontWeight: '450',
        justifyContent: 'start',
        minHeight: '15px',
        minWidth: 'min-content',
        padding: '5px'
    },
});


const DirinfraSelect = ({ registro, erros, options, watch, ...preProps }) => {
    
    const { className, defaultValue, ...props } = preProps;
    const watchSelect = watch && watch(props.name);//monitorar mudança no select, se existir
    const classes = useStyles();
    const temErro = erros && erros[props.name];
    const registroProps = registro && registro(props.name, { required: props.required });

    const [placeholderAtivado, setPlaceholderAtivado] = useState(((defaultValue) || (props.value)) ? false : true);

    useEffect(() => {
        if (!watch) {
            if (!defaultValue) console.warn(`[Componente '${props.name}']: Não foi recebida a propriedade 'watch' do useForm(). O estilo placeholder pode ter problemas por isso!`)
            return;//se não implementar watch, não executa
        }
        setPlaceholderAtivado(!watchSelect);//Se tem valor, desativa estilo de placeholder. Senão, ativa.
    }, [watchSelect]);

    const aoSelecionar = (event) => {
        if (registroProps?.onChange) {
            registroProps.onChange(event);
        }
        if (props?.onChange) {
            props.onChange(event);
        }// Se o componente pai tiver onChange, o código acima repassa o evento, ou não surtirá efeito (no pai)

        if (!placeholderAtivado || !!watch) return;//se tiver watch, o useEffect cuida da lógica (mas após o reset não reativa o estilo)
        setPlaceholderAtivado(false);
    };


    return (
        <div className={`${className || classes.main} `}>
            {/* {props.required && (<em className="obrigatorios">*</em>)} */}
            <label
                className={classes.labelDirinfra}
                style={{ width: '30%' }}
            >
                {props.label || props.name}
            </label>
            <select
                className={
                    `${classes.selectDirinfra}
                     ${placeholderAtivado ? classes.selectPlaceholder : ''}
                     ${temErro ? classes.selectDirinfraErro : classes.selectDirinfraOk}
                `}
                style={{
                    width: props.l ? `${props.l}px` : '65%',  // Aplica a largura se 'l' estiver presente
                }}
                {...registroProps}
                {...props}
                onChange={aoSelecionar}
                defaultValue={placeholderAtivado ? "" : defaultValue}
            >

                <option value="" disabled hidden>{props.placeholder || '<Selecione>'}</option>
                {Array.isArray(options) && options.length > 0 ? (
                    options.map((option, index) => (
                        <option
                            key={index}
                            value={option.value !== undefined ? option.value : option}
                        >
                            {option.label !== undefined ? option.label : option}
                        </option>
                    ))
                ) : (
                    <option disabled>Nenhuma opção disponível</option>
                )}

            </select>
        </div>
    );
};

export default DirinfraSelect;
