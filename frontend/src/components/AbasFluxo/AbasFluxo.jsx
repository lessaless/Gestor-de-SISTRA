import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import objModelos from '../../utils/ColecaoModelo'
import rotas from '../../routes';

const useStyles = makeStyles(theme => ({

    content: {
        border: 'solid 1px var(--color-borderdefault)',
        borderTop: 'none',
        display: 'flex',
        justifyContent: 'center',
        width: '100%'
    },

    abas: {// div
        alignItems: 'end',
        /* backgroundColor: 'var(--color-bg4)', */
        /* borderRight: 'solid 1px var(--color-borderdefault)', */
        borderBottom: 'solid 1px var(--color-borderdefault)',
        /* borderLeft: 'solid 1px var(--color-borderdefault)', */
        boxShadow: 'inset 0 -4px 10px -10px black',
        display: 'flex',
        flexDirection: 'row',
        gap: '5px',
        justifyContent: 'space-around',
        margin: '0px -20px 0px',// superior horizontal inferior, negativo para se sobrepor ao padding do elemento pai
        position: 'relative',
    },

    abasLaterais: {
        borderBottom: 'solid 1px var(--color-borderdefault)',
        minWidth: '5px',
        marginBottom: '-1px'
    },

    aba: {// button
        alignItems: 'flex-end',
        backgroundColor: 'var(--color-bg2)',
        border: 'solid 1px var(--color-borderdefault)',
        borderBottom: 'none',
        borderBottomLeftRadius: '0',
        borderBottomRightRadius: '0',
        color: 'var(--color-font4light)',
        display: 'flex',
        fontWeight: '600',
        height: '32px',
        justifyContent: 'center',
        paddingBottom: '5px',
        width: '100%',
        transition: '10ms'
    },

    abaTrue: {// aba com conteúdo existente
        /* backgroundColor: 'green', */
        boxShadow: 'inset 0 0 30px 4px #aaffcc'// 'sombra interna'
    },

    abaAtiva: { //button
        backgroundColor: 'var(--color-bg1)',
        borderBottom: 'solid 1px var(--color-bg1)',
        height: '35px',
        marginBottom: '-1px',
        paddingBottom: '6px',
        boxShadow: '0 -2px 2px -1px silver',// sombra externa

        '&:hover': {
            opacity: '1'
        }
    },

    abaAtivaTrue: {// aba com conteúdo existente
        /* backgroundColor: 'green', */
        background: 'linear-gradient(180deg, #aaffcc, var(--color-bg1))',
        borderBottom: 'solid 1px var(--color-bg1)',
        marginBottom: '-1px',
        boxShadow: '0 -2px 2px -1px silver',// sombra externa

        '&:hover': {
            opacity: '1'
        }
    },

    divisor: {
        background: 'linear-gradient(180deg, var(--color-bg4), var(--color-bg1))',
        height: '20px',
        margin: '-10px -10px'
    }

}));

const AbasFluxo = () => {

    const classes = useStyles();
    const rotaSemAbas = rotas[2].path;
    const listaColecoes = Object.keys(objColecoes);
    const [mostrarAbas, setMostrarAbas] = useState(true);

    useEffect(() => {
        setMostrarAbas(window.location.pathname.slice(-rotaSemAbas.length) !== rotaSemAbas)
    }, [])

    if (!mostrarAbas) {
        console.log("rota sem abas"); 
        return (
            <div className={classes.divisor}></div>
        )
    };

    if (listaColecoes.length === 0) return (
        <>
            <div className={classes.aba}>
                <label>Nenhuma aba para listar!</label>
            </div>
            <div className={`coluna ${classes.content}`}>
                <label>Componente não fornecido para 'listaColecoes'. Contate um administrador do sistema.</label>
            </div>
        </>
    );


    return (
        <>
            <div className={classes.abas}>
                <div className={classes.abasLaterais}></div>
                {(() => {
                    const buttons = [];
                    listaColecoes.map((colecaoDaLista, i) => {
                        const abaAtiva = colecao === colecaoDaLista;
                        const abaTrue = objColecoes[colecaoDaLista] === true;
                        buttons.push(
                            <button
                                key={i}
                                className={`${classes.aba} ${abaAtiva ? (abaTrue ? classes.abaAtivaTrue : classes.abaAtiva) : ((abaTrue ? classes.abaTrue : ''))}`}
                                onClick={() => {
                                    setColecao(colecaoDaLista)
                                }}
                            >
                                {objModelos[colecaoDaLista]}
                            </button>
                        );
                    })
                    return buttons;
                })()}
                <div className={classes.abasLaterais}></div>
            </div>
        </>
    );
};

export default AbasFluxo;