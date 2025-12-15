import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Dicionario from '../../utils/Dicionario';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const useStyles = makeStyles((theme) => ({
    selecionarCampos: {
        position: 'relative', // Para posicionar o dropdown em relação ao componente
        display: 'inline-block', // Permite que o componente se comporte como um seletor
    },
    selectorHeader: {
        alignItems: 'center',
        border: '1px solid var(--color-borderdefault)',
        borderRadius: '5px',
        color: 'var(--color-font4light)',
        cursor: 'pointer',
        display: 'flex',
        fontSize: '.9rem',
        fontWeight: '500',
        justifyContent: 'start',
        minHeight: '15px',
        minWidth: 'max-content',
        padding: '5px',
        userSelect: 'none'
    },
    selectorHeaderOpen: {
        border: '1px solid var(--color-borderfocus)'
    },
    dropdown: {
        position: 'absolute', // Faz com que o dropdown se sobreponha aos outros elementos
        top: '100%', // Posiciona abaixo do cabeçalho
        left: 0,
        right: 0,
        zIndex: 1000, // Coloca o dropdown acima de outros elementos
        // backgroundColor: 'white',
        border: '1px solid var(--color-borderdefault)',
        borderRadius: '4px',
        boxShadow: '0 5px 8px 1px var(--color-shadow)',
        maxHeight: '400px', // Altura máxima para rolagem
        overflowY: 'auto', // Permite rolagem se a lista for muito longa
    },
    dropdownList: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
        backgroundColor: 'var(--color-bg1)',
    },
    dropdownItem: {
        padding: '10px',
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: 'var(--color-borderfocus)',
            color: 'var(--color-font4dark)'
        },
        userSelect: 'none'
    },
    labelSelMulti: {
        marginLeft: '5px',
        cursor: 'inherit'// 'herda' o estilo do elemento li (pai), definido condicionalmente
    },
    checkBox: {
        cursor: 'inherit'// 'herda' o estilo do elemento li (pai), definido condicionalmente
    },
    iconeDD: {
        fontSize: '1.12rem  !important'
    }
}));

const DirinfraSeletorMultiplo = ({ titulo, listaChaves, camposVisiveis, alterarCamposVisiveis, checkBloqueado }) => {
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);

    const dropdownRef = useRef(null); // Ref para detectar cliques fora do dropdown

    // Fechar o dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        // Adiciona o listener de cliques fora
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            // Remove o listener ao desmontar o componente
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);


    if (!listaChaves.length > 0) return null;

    return (
        <div className={classes.selecionarCampos} ref={dropdownRef}>

            <div
                className={`
                    ${classes.selectorHeader} 
                    ${isOpen ? classes.selectorHeaderOpen : {}}
                `}
                onClick={() => setIsOpen(!isOpen)
                }
            >
                {titulo || 'Selecionar Campos'} {isOpen ? <ExpandLessIcon className={classes.iconeDD} /> : <ExpandMoreIcon className={classes.iconeDD} />}
            </div>

            {isOpen && (
                <div className={classes.dropdown}>
                    <ul className={classes.dropdownList}>
                        {listaChaves.map((campo, index) => (
                            <li
                                style={{ cursor: checkBloqueado === campo.nome ? 'not-allowed' : 'pointer' }}
                                key={index}
                                className={classes.dropdownItem}
                                onClick={() => {
                                    if (checkBloqueado !== campo.nome) {
                                        alterarCamposVisiveis(campo.nome);
                                    }
                                }}
                            >
                                <input
                                    className={classes.checkBox}
                                    id={`checkbox_${index}`}
                                    type="checkbox"
                                    checked={camposVisiveis[campo.nome]}
                                    onChange={() => alterarCamposVisiveis(campo.nome)} // O evento onChange ainda é necessário
                                    disabled={checkBloqueado === campo.nome}
                                    onClick={(e) => e.stopPropagation()} // Previne o clique do li de acionar o checkbox novamente
                                />
                                <label className={classes.labelSelMulti}>{Dicionario(campo.nome)}</label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DirinfraSeletorMultiplo;
