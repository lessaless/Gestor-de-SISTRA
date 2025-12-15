import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { makeStyles } from '@material-ui/core/styles';

// Estilos com makeStyles
const useStyles = makeStyles({
    concordarOverlay: {
        backgroundColor: 'var(--color-overlay)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
    },
    concordarContainer: {
        backgroundColor: 'var(--color-bg1)',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: 'var(--color-neon)',
        maxWidth: '800px',
        width: '100%',
        height: 'fit-content',
        color: 'var(--color-font4light)',
        fontWeight: 500,
        overflowY: 'scroll',
        textAlign: 'justify',
        margin: '20px auto',
    },
    ppParagrafo: {
        fontSize: '1rem',
        lineHeight: '1.4rem',
        margin: 0,
        textAlign: 'center'
        /* textIndent: '2rem', */
    },
    ppSecao: {
        fontWeight: 600,
        textIndent: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center'
    },
    concordarButtons: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '20px',
        gap: '10px'
    },
    cancelarButton: {
        backgroundColor: 'var(--botao-deletar)',
        borderColor: 'var(--botao-deletar)',
    },

    confirmarButton: {
        backgroundColor: 'var(--botao-novo)',
        borderColor: 'var(--botao-novo)',
    },
});

const ConcordarModal = ({ titulo, mensagem, btFalseName, btTrueName, onConfirm, onCancel }) => {
    const classes = useStyles();

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onCancel();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onCancel]);

    return (
        <div className={classes.concordarOverlay}>
            <div className={classes.concordarContainer}>

                <p className={`${classes.ppParagrafo} ${classes.ppSecao}`}>{titulo || ''}</p>

                <p className={classes.ppParagrafo}>
                    {mensagem || 'Confirmar ação?'}
                </p>

                <div className={classes.concordarButtons}>
                    <button className={`${classes.cancelarButton}`} onClick={onCancel}>
                        {btFalseName || 'Discordo'}
                    </button>
                    <button autoFocus className={classes.confirmarButton} onClick={onConfirm}>
                        {btTrueName || 'Concordo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Concordar = (titulo, mensagem, btFalseName, btTrueName) => {
    return new Promise((resolve) => {
        const portalDiv = document.createElement('div');
        document.body.appendChild(portalDiv);

        const handleClose = () => {
            resolve(false);
            root.unmount(); // Desmonta a raiz criada
            document.body.removeChild(portalDiv);
        };

        const handleConfirm = () => {
            resolve(true);
            root.unmount(); // Desmonta a raiz criada
            document.body.removeChild(portalDiv);
        };

        const root = ReactDOM.createRoot(portalDiv); // Cria a raiz
        root.render(
            <ConcordarModal
                titulo={titulo}
                mensagem={mensagem}
                btFalseName={btFalseName}
                btTrueName={btTrueName}
                onConfirm={handleConfirm}
                onCancel={handleClose}
            />
        );
    });
};

export default Concordar;
