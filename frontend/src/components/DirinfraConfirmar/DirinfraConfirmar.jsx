import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  confirmarOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'var(--color-overlay)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  confirmarContainer: {
    backgroundColor: 'var(--color-bg1)',
    padding: '40px 20px 20px',
    borderRadius: 5,
    boxShadow: 'var(--color-neon)',
    maxWidth: 500,
    width: '100%',
    color: 'var(--color-font4light)',
    fontWeight: 550,
    fontSize: 16, // Ajuste o valor para o tamanho desejado
  },
  confirmarButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  confirmarCancel: {
    backgroundColor: 'var(--botao-deletar)',
    borderColor: 'var(--botao-deletar)',
    marginRight: 10,
  },

  confirmarConfirm: {
    backgroundColor: 'var(--botao-novo)',
    borderColor: 'var(--botao-novo)',
  },
  confirmarMessage: {
    textAlign: 'center',
    userSelect: 'none'
  },

  inputConfirmar: {
    backgroundColor: 'var(--color-bg1)',
    border: 'solid 1px var(--color-borderdefault)',
    borderRadius: '5px',
    color: 'var(--color-font4light)',
    fontSize: '.9rem',
    fontWeight: '500',
    marginTop: '20px',
    minHeight: '15px',
    padding: '5px',
    transition: 'all 500ms ease',
    whiteSpace: 'normal',
    width: '100%',
    wordBreak: 'break-word',

    '&:focus, &:focus-visible': {
      borderColor: 'var(--color-borderfocus)',
      outline: 'none !important',
    }
  }
}));

const Confirmar = ({ mensagem, onConfirm, onCancel }) => {
  const [inputValue, setInputValue] = useState('');
  const classes = useStyles();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className={classes.confirmarOverlay}>
      <div className={classes.confirmarContainer}>
        <p className={classes.confirmarMessage}>{mensagem}</p>
        <div
        /* style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }} */
        >

          <input
            className={classes.inputConfirmar}
            type='text'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onConfirm(inputValue);
              }
              if (e.key === 'Escape') {
                onCancel();
              }
            }}
            autoFocus
          />

        </div>
        <div className={classes.confirmarButtons}>
          <button className={classes.confirmarCancel} onClick={onCancel}>
            Cancelar
          </button>
          <button className={classes.confirmarConfirm} onClick={() => onConfirm(inputValue)}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const DirinfraConfirmar = (mensagem) => {
  return new Promise((resolve) => {
    const portalDiv = document.createElement('div');
    document.body.appendChild(portalDiv);

    const root = createRoot(portalDiv);

    const handleClose = () => {
      resolve(null);
      root.unmount();
      document.body.removeChild(portalDiv);
    };

    const handleConfirm = (value) => {
      resolve(value);
      root.unmount();
      document.body.removeChild(portalDiv);
    };

    root.render(
      <Confirmar
        mensagem={mensagem}
        onConfirm={handleConfirm}
        onCancel={handleClose}
      />
    );
  });
};

export default DirinfraConfirmar;
