import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@mui/icons-material/Search';


const useStyles = makeStyles({
    container: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '5px',
        width: '100%'
    },
    labelDirinfra: {
        alignItems: 'center',
        color: 'var(--color-font4light)',
        display: 'flex',
        fontSize: '.95rem',
        fontWeight: '450',
        justifyContent: 'start',
        minHeight: '15px',
        paddingLeft:'20px',
        minWidth: 'min-content',
        padding: '5px'
    },
    selectDisplay: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        // boxShadow: '0 0 8px 0px var(--color-shadow)',
        backgroundColor: 'var(--color-bg1)',
        borderRadius: '5px',
        border: 'solid 1px',
        color: 'var(--color-font4light)',
        padding: '16px 12px',
        fontSize: '.7rem',
        fontWeight: '500',
        marginLeft:'16px',
        transition: 'all 200ms ease',
        gap: '8px',
        pointerEvents: 'none', // Not clickable
    },
    selectDisplayOk: {
        borderColor: 'var(--color-borderdefault)',
    },
    selectDisplayErro: {
        borderColor: 'var(--color-borderError)',
    },
    selectDisplayDisabled: {
        backgroundColor: 'var(--color-disabled)',
    },
    searchButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        minWidth: '40px',
        minHeight: '40px',
        backgroundColor: 'var(--color-bg1)',
        border: 'solid 1px var(--color-borderdefault)',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        boxShadow: '0 0 8px 0px var(--color-shadow)',
        color: 'var(--color-font4light)', 

        '&:hover': {
            borderColor: 'var(--color-borderfocus)',
            backgroundColor: 'var(--color-borderfocus)',
            transform: 'scale(1.05)',
        },
        '&:focus, &:focus-visible': {
            outline: 'none !important',
            borderColor: 'var(--color-borderfocus)',
        },
        '&:disabled': {
            backgroundColor: 'var(--color-disabled)',
            cursor: 'not-allowed',
            opacity: 0.6,
        }
    },
    buttonText: {
        flex: 1,
        fontSize: '.87rem',
        overflow: 'hidden',
        textAlign: 'left',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
    },
    placeholder: {
        fontStyle: 'italic',
        color: 'var(--color-placeholder)',
    },
    displayWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
    },
    selectButtonOk: {
        borderColor: 'var(--color-borderdefault)',
    },
    selectButtonErro: {
        borderColor: 'var(--color-borderError)',
    },
    placeholder: {
        fontStyle: 'italic',
        color: 'var(--color-placeholder)',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: '$fadeIn 200ms ease',
    },
    '@keyframes fadeIn': {
        from: {
            opacity: 0,
        },
        to: {
            opacity: 1,
        }
    },
    modalContent: {
        backgroundColor: 'var(--color-bg1, #fff)',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '900px',
        width: '95%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        animation: '$slideUp 300ms ease',
    },
    '@keyframes slideUp': {
        from: {
            transform: 'translateY(20px)',
            opacity: 0,
        },
        to: {
            transform: 'translateY(0)',
            opacity: 1,
        }
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid var(--color-borderdefault, #ddd)',
    },
    modalTitle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: '600',
        color: 'var(--color-font4light)',
        margin: 0,
        flex: 1,
        textAlign: 'center',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: 'var(--color-font4light)',
        padding: '0',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        transition: 'background-color 200ms ease',

        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
        }
    },
    searchInput: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '1rem',
        border: '1px solid var(--color-borderdefault)',
        borderRadius: '5px',
        marginBottom: '12px',
        backgroundColor: 'var(--color-bg1)',
        color: 'var(--color-font4light)',

        '&:focus': {
            outline: 'none',
            borderColor: 'var(--color-borderfocus)',
            boxShadow: '0 0 0 2px rgba(var(--color-borderfocus-rgb, 66, 153, 225), 0.2)',
        }
    },
    headerRow: {
        padding: '16px 20px',
        paddingRight: '28px',
        backgroundColor: 'var(--color-bg1)',
        border: '1px solid var(--color-borderdefault)',
        borderRadius: '5px',
        fontSize: '1rem',
        color: 'var(--color-font4light)',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '12px',
    },
    headerCode: {
        fontWeight: '600',
        fontSize: '0.95rem',
        color: 'var(--color-font4light)',
        width: '100px',
        minWidth: '100px',
        flexShrink: 0,
        padding: '4px 8px',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        textAlign: 'center',
        border: '1px solid var(--color-borderdefault)',
    },
    headerLabel: {
        flex: 1,
        textAlign: 'left',
        paddingLeft: '25px',
    },
    optionsList: {
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingRight: '8px',

        '&::-webkit-scrollbar': {
            width: '8px',
        },
        '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: 'var(--color-borderdefault, #ccc)',
            borderRadius: '4px',
            '&:hover': {
                background: 'var(--color-borderfocus, #999)',
            }
        }
    },
    optionItem: {
        padding: '16px 20px',
        backgroundColor: 'var(--color-bg1)',
        border: '1px solid var(--color-borderdefault)',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        fontSize: '1rem',
        color: 'var(--color-font4light)',
        lineHeight: '1.5',
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        minHeight: '107px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',

        '&:hover': {
            backgroundColor: 'var(--color-borderfocus)',
            borderColor: 'var(--color-borderfocus)',
            transform: 'translateX(4px)',
        }
    },
    optionCode: {
        fontWeight: '600',
        fontSize: '0.95rem',
        color: 'var(--color-font4light)',
        minWidth: '60px',
        flexShrink: 0,
        padding: '4px 8px',
        backgroundColor: 'transparent',
        borderRadius: '4px',
        textAlign: 'center',
        border: '1px solid var(--color-borderdefault)',
    },
    optionLabel: {
        flex: 1,
    },
    optionItemSelected: {
        backgroundColor: 'var(--color-borderfocus)',
        borderColor: 'var(--color-borderfocus)',
        fontWeight: '500',
    },
    noResults: {
        textAlign: 'center',
        padding: '20px',
        color: 'var(--color-placeholder)',
        fontStyle: 'italic',
    },
    icon: {
        marginLeft: '8px',
        fontSize: '1rem',
    }
});

const DirinfraSelectModal = ({ registro, erros, options, watch, setValue, showCode, ...preProps }) => {
    const { className, defaultValue, ...props } = preProps;
    const classes = useStyles();
    const temErro = erros && erros[props.name];
    const registroProps = registro && registro(props.name, { required: props.required });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValue, setSelectedValue] = useState(defaultValue || props.value || '');

    // Watch for form value changes
    const watchValue = watch && watch(props.name);

    useEffect(() => {
        if (watchValue !== undefined) {
            setSelectedValue(watchValue);
        }
    }, [watchValue]);

    // Get the label for the selected value
    const getSelectedOption = () => {
        if (!selectedValue) return null;

        const selectedOption = options?.find(opt => {
            const optValue = opt.value !== undefined ? opt.value : opt;
            return String(optValue) === String(selectedValue);
        });

        return selectedOption || null;
    };

    // Filter options based on search term
    const filteredOptions = options?.filter(option => {
        const label = option.label !== undefined ? option.label : option;
        const code = option.code || '';
        const searchLower = searchTerm.toLowerCase();

        return label.toLowerCase().includes(searchLower) ||
            code.toLowerCase().includes(searchLower);
    }) || [];

    const handleSelectOption = (option) => {
        const value = option.value !== undefined ? option.value : option;

        setSelectedValue(value);

        // Update react-hook-form
        if (setValue) {
            setValue(props.name, value, { shouldValidate: true });
        }

        // Call onChange if provided
        if (registroProps?.onChange) {
            registroProps.onChange({ target: { value, name: props.name } });
        }
        if (props?.onChange) {
            props.onChange({ target: { value, name: props.name } });
        }

        setIsModalOpen(false);
        setSearchTerm('');
    };

    const handleOpenModal = () => {
        if (!props.disabled) {
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSearchTerm('');
    };

    const selectedOption = getSelectedOption();
    const selectedLabel = selectedOption
        ? (selectedOption.label !== undefined ? selectedOption.label : selectedOption)
        : null;
    const selectedCode = selectedOption?.code;

    return (
        <>
            <div className={`${className || classes.container}`}>
                <label
                    className={classes.labelDirinfra}
                    style={{ width: '30%' }}
                >
                    {props.label || props.name}
                </label>

                <div
                    className={classes.displayWrapper}
                    style={{
                        width: props.l ? `${props.l}px` : '65%',
                        marginTop:'10px',
                    }}
                >
                    <div
                        className={`${classes.selectDisplay} ${temErro
                                ? classes.selectDisplayErro
                                : classes.selectDisplayOk
                            } ${props.disabled ? classes.selectDisplayDisabled : ''}`}
                        style={{
                            minHeight: selectedLabel ? '100px' : '60px',
                            height: 'auto',
                            flex: 1,
                        }}
                    >
                        {selectedCode && (
                            <span className={classes.optionCode}>
                                {selectedCode}
                            </span>
                        )}
                        <span
                            className={`${classes.buttonText} ${selectedLabel ? '' : classes.placeholder}`}
                            style={{
                                whiteSpace: selectedLabel ? 'normal' : 'nowrap',
                                textOverflow: selectedLabel ? 'clip' : 'ellipsis',
                                lineHeight: selectedLabel ? 1.3 : 'normal',
                            }}
                        >
                            {selectedLabel || props.placeholder || '<Selecione>'}
                        </span>
                    </div>

                    <button
                        type="button"
                        className={classes.searchButton}
                        onClick={handleOpenModal}
                        disabled={props.disabled}
                        title="Buscar"
                    >
                        <SearchIcon />
                    </button>
                </div>

                {/* Hidden input for react-hook-form */}
                <input
                    type="hidden"
                    {...registroProps}
                    value={selectedValue}
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className={classes.modalOverlay} onClick={handleCloseModal}>
                    <div
                        className={classes.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={classes.modalHeader}>
                            <h3 className={classes.modalTitle}>
                                {props.label || props.name}
                            </h3>
                            <button
                                className={classes.closeButton}
                                onClick={handleCloseModal}
                                type="button"
                            >
                                ×
                            </button>
                        </div>

                        <input
                            type="text"
                            className={classes.searchInput}
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />

                        {/* Header Row */}
                        <div className={classes.headerRow}>
                            <span className={classes.headerCode}>
                                Código
                            </span>
                            <span className={classes.headerLabel}>
                                Descrição
                            </span>
                        </div>

                        <div className={classes.optionsList}>
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => {
                                    const optValue = option.value !== undefined ? option.value : option;
                                    const optLabel = option.label !== undefined ? option.label : option;
                                    const isSelected = String(optValue) === String(selectedValue);

                                    return (
                                        <div
                                            key={index}
                                            className={`${classes.optionItem} ${isSelected ? classes.optionItemSelected : ''
                                                }`}
                                            onClick={() => handleSelectOption(option)}
                                        >
                                            {option.code && (
                                                <span className={classes.optionCode}>
                                                    {option.code}
                                                </span>
                                            )}
                                            <span className={classes.optionLabel}>
                                                {optLabel}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className={classes.noResults}>
                                    Nenhum resultado encontrado
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DirinfraSelectModal;