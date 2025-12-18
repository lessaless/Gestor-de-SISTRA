import React, { useEffect, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    main: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '5px',
        width: '100%',
        position: 'relative',
        padding: '1px',
        paddingTop:'7px',
    },
    customSelectContainer: {
        position: 'relative',
        width: '65%',
    },
    customSelectHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--color-bg1)',
        borderRadius: '5px',
        border: 'solid 1px',
        color: 'var(--color-font4light)',
        padding: '5px 10px',
        fontSize: '.7rem',
        fontWeight: '500',
        cursor: 'pointer',
        userSelect: 'none',
        
        '&:focus, &:focus-visible': {
            outline: 'none !important',
        }
    },
    customSelectHeaderOk: {
        borderColor: 'var(--color-borderdefault)',
        '&:focus, &:focus-visible': {
            borderColor: 'var(--color-borderfocus)'
        }
    },
    customSelectHeaderErro: {
        borderColor: 'var(--color-borderError)',
        '&:focus, &:focus-visible': {
            borderColor: 'var(--color-borderError)'
        }
    },
    customSelectHeaderDisabled: {
        backgroundColor: 'var(--color-disabled)',
        cursor: 'not-allowed'
    },
    selectPlaceholder: {
        fontStyle: 'italic',
        color: 'var(--color-placeholder)',
        fontSize: '.95rem',
        
    },
    customSelectDropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-bg1)',
        
        border: 'solid 1px var(--color-borderdefault)',
        borderRadius: '5px',
        marginTop: '2px',
        maxHeight: '200px',
        overflowY: 'auto',
        zIndex: 1000,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    customSelectOption: {
        padding: '8px 10px',
        fontSize: '.9rem',
        color: 'var(--color-font4light)',
        cursor: 'pointer',
        wordWrap: 'break-word',
        whiteSpace: 'normal',
        lineHeight: '1.4',
        
        '&:hover': {
            backgroundColor: 'var(--color-borderfocus)',
            color: '#fff'
        }
    },
    customSelectOptionDisabled: {
        color: 'var(--color-placeholder)',
        cursor: 'not-allowed',
        '&:hover': {
            backgroundColor: 'transparent',
            color: 'var(--color-placeholder)'
        }
    },
    arrow: {
        marginLeft: '8px',
        transition: 'transform 0.2s',
    },
    arrowOpen: {
        transform: 'rotate(180deg)'
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
        padding: '5px',
        width: '30%'
    },
});

const DirinfraSelect = ({ registro, erros, options, watch, setValue, ...preProps }) => {
    const { className, defaultValue, ...props } = preProps;
    const watchSelect = watch && watch(props.name);
    const classes = useStyles();
    const temErro = erros && erros[props.name];
    const registroProps = registro && registro(props.name, { required: props.required });
    
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Initialize selected option from defaultValue or watchSelect
        if (options && options.length > 0) {
            const initial = watchSelect || defaultValue || props.value;
            if (initial) {
                const found = options.find(opt => 
                    (opt.value !== undefined ? opt.value : opt) === initial
                );
                setSelectedOption(found);
            }
        }
    }, [options, watchSelect, defaultValue, props.value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (option) => {
        const value = option.value !== undefined ? option.value : option;
        setSelectedOption(option);
        setIsOpen(false);
        
        // Update React Hook Form
        if (setValue) {
            setValue(props.name, value, { shouldValidate: true });
        }
        
        // Call onChange handlers
        const syntheticEvent = {
            target: { name: props.name, value: value }
        };
        
        if (registroProps?.onChange) {
            registroProps.onChange(syntheticEvent);
        }
        if (props?.onChange) {
            props.onChange(syntheticEvent);
        }
    };

    const toggleDropdown = () => {
        if (!props.disabled) {
            setIsOpen(!isOpen);
        }
    };

    const getDisplayText = () => {
        if (selectedOption) {
            return selectedOption.label !== undefined ? selectedOption.label : selectedOption;
        }
        return props.placeholder || '<Selecione>';
    };

    const isPlaceholder = !selectedOption;

    return (
        <div className={`${className || classes.main}`}>
            <label className={classes.labelDirinfra}>
                {props.label || props.name}
            </label>
            
            <div 
                className={classes.customSelectContainer}
                style={{ width: props.l ? `${props.l}px` : '65%' }}
                ref={dropdownRef}
            >
                {/* Hidden input for React Hook Form */}
                <input
                    type="hidden"
                    {...registroProps}
                    value={selectedOption ? (selectedOption.value !== undefined ? selectedOption.value : selectedOption) : ''}
                />
                
                {/* Custom Select Header */}
                <div
                    className={`
                        ${classes.customSelectHeader}
                        ${isPlaceholder ? classes.selectPlaceholder : ''}
                        ${props.disabled ? classes.customSelectHeaderDisabled : ''}
                        ${temErro ? classes.customSelectHeaderErro : classes.customSelectHeaderOk}
                    `}
                    onClick={toggleDropdown}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleDropdown();
                        }
                    }}
                >
                    <span>{getDisplayText()}</span>
                    <span className={`${classes.arrow} ${isOpen ? classes.arrowOpen : ''}`}>
                        ▼
                    </span>
                </div>
                
                {/* Dropdown Options */}
                {isOpen && (
                    <div className={classes.customSelectDropdown}>
                        {Array.isArray(options) && options.length > 0 ? (
                            options.map((option, index) => {
                                const optionValue = option.value !== undefined ? option.value : option;
                                const optionLabel = option.label !== undefined ? option.label : option;
                                const isDisabled = option.disabled;
                                
                                return (
                                    <div
                                        key={index}
                                        className={`
                                            ${classes.customSelectOption}
                                            ${isDisabled ? classes.customSelectOptionDisabled : ''}
                                        `}
                                        onClick={() => !isDisabled && handleSelect(option)}
                                    >
                                        {optionLabel}
                                    </div>
                                );
                            })
                        ) : (
                            <div className={`${classes.customSelectOption} ${classes.customSelectOptionDisabled}`}>
                                Nenhuma opção disponível
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirinfraSelect;