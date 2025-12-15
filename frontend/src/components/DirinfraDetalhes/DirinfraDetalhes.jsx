import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { makeStyles } from '@material-ui/core/styles';
import Dicionario from '../../utils/Dicionario';
import formatarData from '../../utils/formatarData';
import Loading from '../../components/Loader/Loading';

const useStyles = makeStyles(() => ({
  detalhesOverlay: {
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
  detalhesContainer: {
    backgroundColor: 'var(--color-bg1)',
    borderRadius: '8px',
    boxShadow: 'var(--color-neon)',
    color: 'var(--color-font4light)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    maxWidth: '50%',
    width: '100%',
    padding: 12,
    // paddingRight: 4,
    gap: 10
  },
  detalhesContent: {
    border: '1px solid var(--color-borderdefault)',
    borderRadius: '4px',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: '28px',
    overflowY: 'auto',
    padding: '18px',
  },
  detalhesButtons: {
    display: 'flex',
    justifyContent: 'center',
    // padding: '10px 20px 0',
    backgroundColor: 'var(--color-bg1)',
    flexShrink: 0,
    margin: 6
  },
  detalhesClose: {
    backgroundColor: 'var(--botao-deletar)',
    borderColor: 'var(--botao-deletar)',
    marginRight: 14,
  },
  detalhesEdit: {
    backgroundColor: 'var(--botao-novo)',
    borderColor: 'var(--botao-novo)',
  },
  detalhesChave: {
    display: 'flex',
    textAlign: 'start',
    '& > label': {
      width: '180px',
      minWidth: '180px',
      maxWidth: '180px',
      fontWeight: 650,
    },
    '& > em': {
      fontWeight: 300,
      marginLeft: '5px',
      textAlign: 'justify',
    },
  },
  avisoErro: {
    fontSize: '0.75rem',
    marginTop: '20px',
    color: 'var(--color-borderError)',
    width: '100%',
    textAlign: 'center'
  },
  divisorBotao: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'start'
  },
  arquivoNome: {
    /* color: 'var(--color-link)', */
    fontSize: '0.8rem',
    padding: '4px',
    margin: '0 4px',
    width: 'fit-content',
  },
}));

const Detalhes = ({ objeto, onEdit, onClose }) => {
  const classes = useStyles();
  const [link, setLink] = useState(null);
  const [objetoNaPagina, setObjetoNaPagina] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [popupBloqueado, setPopupBloqueado] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    console.log(objeto)
    if ('arquivo_id' in objeto) {

      setLink(`${process.env.REACT_APP_BACKEND}/api/arquivo/baixar/${objeto.arquivo_id}`);
    }

    const { colecao, arquivo_id, _id, ...restoObjeto } = objeto;
    console.log("Valor de ...objeto é", objeto)
    const objetoFormatado = Object.keys(restoObjeto).reduce((acc, campo) => {
      const valor = restoObjeto[campo];
      if (valor == null || valor === '') return acc;
      acc[campo] = campo.startsWith('data') || ['expireAt', 'createdAt', 'updatedAt'].includes(campo)
        ? formatarData(valor)
        : valor;
      return acc;
    }, {});

    setObjetoNaPagina(objetoFormatado);
    setIsLoading(false);
  }, [objeto]);

  return (
    <div className={classes.detalhesOverlay}>
      <div className={classes.detalhesContainer} onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === 'Escape') onClose();
      }}>
        <div className={classes.detalhesContent}>
          {isLoading ? (
            <Loading />
          ) : (
            <>
              {Object.keys(objetoNaPagina).map((campo, i) => (
                <p key={i} className={classes.detalhesChave}>
                  <label>{Dicionario(campo)}:</label>
                  <em>{String(objetoNaPagina[campo])}</em>
                </p>
              ))}

              {link && (
                // <a href={link} className={classes.arquivoNome} title="Baixar anexo">
                //   Anexo
                // </a>

                <div className={classes.divisorBotao}>
                  <button onClick={() => {
                    const newWindow = window.open(link, '_blank');
                    if (!newWindow) {
                      // A janela de pop-up pode ter sido bloqueada
                      console.error("Pop-up bloqueado pelo navegador!");
                      setPopupBloqueado(true); // Remove or define setPopupBloqueado if needed
                    } else {
                      setPopupBloqueado(false); // Remove or define setPopupBloqueado if needed
                    }
                  }}>
                    Baixar anexo
                  </button>

                </div>
              )}

              {popupBloqueado && (
                <div className={classes.avisoErro}>
                  ⚠️ O navegador bloqueou a abertura da nova aba. Permita pop-ups para baixar o arquivo.
                </div>
              )}
            </>
          )}
        </div>

        <div className={classes.detalhesButtons}>
          <button autoFocus className={classes.detalhesClose} onClick={onClose}>Fechar</button>
          <button className={classes.detalhesEdit} onClick={onEdit}>Editar</button>
        </div>
      </div>
    </div >
  );
};

const DirinfraDetalhes = (obj) => {
  return new Promise((resolve) => {
    const portalDiv = document.createElement('div');
    document.body.appendChild(portalDiv);

    const root = createRoot(portalDiv);

    const handleClose = () => {
      resolve('Listar');
      root.unmount();
      document.body.removeChild(portalDiv);
    };

    const handleEdit = () => {
      resolve('Editar');
      root.unmount();
      document.body.removeChild(portalDiv);
    };

    root.render(<Detalhes objeto={obj} onEdit={handleEdit} onClose={handleClose} />);
  });
};

export default DirinfraDetalhes;
