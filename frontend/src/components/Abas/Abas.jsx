import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({

    main: {
        backgroundColor: 'var(--color-bg4)',
        width: '100%'
    },

    content: {
        backgroundColor: 'var(--color-bg4)',
        border: 'solid 1px var(--color-borderdefault)',
        borderTop: 'none',
        paddingTop: '10px',
        display: 'flex',
        width: '100%'
    },

    abas: {//div
        alignItems: 'end',
        backgroundColor: 'var(--color-bg1)',
        borderBottom: 'solid 1px var(--color-borderdefault)',
        display: 'flex',
        flexDirection: 'row',
        gap: '5px',
        justifyContent: 'space-around',
        margin: '0 0 0',//superior horizontal inferior
        position: 'relative',
        width: '100%'
    },

    aba: {//button
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

    ativa: {//button
        backgroundColor: 'var(--color-bg4)',
        borderBottom: 'solid 1px var(--color-bg4)',
        height: '35px',
        marginBottom: '-1px',
        paddingBottom: '6px',

        '&:hover': {
            opacity: '1'
        }
    }

}));

const Abas = ({ listaObjPaginas, paginaAtual, setPagina }) => {

    const classes = useStyles();
    const [indice, setIndice] = useState(0);

    useEffect(() => {
        let listaPaginas = listaObjPaginas.map(item => item.pagina);
        setIndice(listaPaginas.indexOf(paginaAtual));
    }, [paginaAtual]);

    if (listaObjPaginas.length === 0) return (
        <>
        <div className={classes.aba}>
            <label>Nenhuma aba para listar!</label>
        </div>
        <div className={`coluna ${classes.content}`}>
            <label>Componente não fornecido para 'listaObjPaginas'.</label>
        </div>
        </>
    );
    return (
        <div className={classes.main}>
            <div className={classes.abas}>
                {(() => {
                    const buttons = [];
                    listaObjPaginas.map((obj, i) => {
                        buttons.push(
                            <button
                                key={i}
                                className={`${classes.aba} ${paginaAtual === obj.pagina ? classes.ativa : ''}`}
                                onClick={() => {
                                    setIndice(i);
                                    setPagina(obj.pagina)
                                }}
                            >
                                {obj.pagina}
                            </button>
                        );
                    })
                    return buttons;
                })()}
            </div>

            <div className={`coluna ${classes.content}`}>
                {listaObjPaginas[indice]?.componente}
            </div>
        </div>
    );
};

export default Abas;