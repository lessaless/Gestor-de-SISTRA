import { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const useStyles = makeStyles(theme => ({
  main: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: '20px 0 20px',
    width: '100%',
  },

  inputArquivo: {
    display: 'none'
  },

  arquivoItem: {
    alignItems: 'center',
    backgroundColor: 'var(--color-bg4)',
    borderRadius: '3px',
    boxShadow: '0 0 5px 0px var(--color-shadow)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    marginTop: '20px',
    minHeight: '26px',
    padding: '4px',
    userSelect: 'none',

    '&:hover': {
      backgroundColor: 'var(--color-hover)',
      color: 'var(--color-font4light)'
    }
  },

  arquivoNome: {
    fontSize: '0.8rem',
    padding: '3px',
    margin: '0 4px',
  },
  divisor: {
    height: '26px',
    margin: '0',
    padding: '0',
    borderLeft: 'solid 1px var(--color-borderdefault)'
  },
  arquivoRemover: {
    fontSize: '0.8rem',
    padding: '3px',
    margin: '0 4px',
    '&:hover': {
      backgroundColor: 'var(--color-hover)',
      color: 'var(--color-borderError)'
    }
  },

  uploadArea: {
    alignItems: 'center',
    backgroundColor: 'var(--color-bg3)',
    border: 'dashed 2px var(--color-borderdefault)',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    height: '150px',
    justifyContent: 'center',
    padding: '10px',
    textAlign: 'center',
    width: '100%',

    '& > label, & > label > b': {
      cursor: 'pointer',
      userSelect: 'none',
      fontSize: '0.8rem',
      marginTop: '5px'
    },

    '&:hover': {
      backgroundColor: 'var(--color-hover)',
      cursor: 'pointer'
    }
  },
  arrastarOk: {
    boxShadow: '0px 0px 12px 0px lightgreen',
    backgroundColor: '#90ee9022',
  },
  inputDirinfraErro: {
    boxShadow: '0px 0px 12px 0px var(--color-borderError)',
  },
  inputDirinfraOk: {
    boxShadow: 'green',
  },
  aviso: {
    fontSize: '0.7rem',
    marginTop: '8px',
    color: 'var(--color-font4light)',
    width: '100%',
    textAlign: 'center'
  },

  avisoErro: {
    fontSize: '0.75rem',
    marginTop: '20px',
    color: 'var(--color-borderError)',
    width: '100%',
    textAlign: 'center'
  }
}));

const GerenciadorDeArquivo = (props) => {

  const { arquivo, setArquivo, atualizarIsDirty, temErroArquivo, setTemErroArquivo } = props;
  const requiredProps = ['arquivo', 'setArquivo', 'atualizarIsDirty', 'temErroArquivo', 'setTemErroArquivo'];

  const [popupBloqueado, setPopupBloqueado] = useState(false);

  const classes = useStyles();
  const inputArquivoRef = useRef();

  requiredProps.forEach(prop => {
    if (props[prop] === undefined) {
      console.warn(`[GerenciadorDeArquivo]: A propriedade "${prop}" não foi passada! Isso pode ocasionar falhas no componente!`);
    }
  });

  const aoClicar = () => {
    inputArquivoRef.current.click();
  };

  const aoSelecionarArquivo = () => {
    const arquivoSelecionado = inputArquivoRef?.current?.files[0];
    if (!arquivoSelecionado) return;
    setArquivo(arquivoSelecionado);
    if (temErroArquivo) setTemErroArquivo(false);
    atualizarIsDirty(true);
  };

  const removerArquivo = () => {
    setArquivo(null);
    atualizarIsDirty(true);
  };

  const aoArrastar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    e.currentTarget.classList.add(classes.arrastarOk);
  };

  const aoPararDeArrastar = (e) => {
    e.currentTarget.classList.remove(classes.arrastarOk);
  };

  const aoSoltar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const arquivoArrastado = e.dataTransfer.files[0];
    setArquivo(arquivoArrastado);
    setTemErroArquivo(false)
    atualizarIsDirty(true);
    e.currentTarget.classList.remove(classes.arrastarOk);
  };


  return (
    <div className={classes.main}>

      <input
        className={classes.inputArquivo}
        type="file"
        ref={inputArquivoRef}
        onClick={(e) => e.target.value = null}
        onChange={aoSelecionarArquivo}
      />

      <div
        className={`${classes.uploadArea} ${temErroArquivo ? classes.inputDirinfraErro : classes.inputDirinfraOk}`}
        onClick={aoClicar}
        onDrop={aoSoltar}
        onDragOver={aoArrastar}
        onDragLeave={aoPararDeArrastar}
      >
        <CloudUploadIcon style={{ fontSize: '70px' }} />
        <label><b>Clique</b> para escolher ou <b>Arraste e Solte</b> o arquivo* aqui.</label>
      </div>
      <div className={classes.aviso}>*Apenas documentos de caráter ostensivo podem ser compartilhados.</div>
      {arquivo && (
        <>
          <div className={classes.arquivoItem}>

            <span
              title='Baixar arquivo'
              className={classes.arquivoNome}

              onClick={() => {

                let url;

                if (arquivo._id) {//se veio do BD
                  url = `${process.env.REACT_APP_BACKEND}/api/arquivo/baixar/${arquivo._id}`;

                } else {
                  url = URL.createObjectURL(arquivo);

                }
                const newWindow = window.open(url, '_blank');

                if (!arquivo._id) {
                  URL.revokeObjectURL(url);

                }

                if (!newWindow) {
                  // A janela de pop-up pode ter sido bloqueada
                  console.error("Pop-up bloqueado pelo navegador!");
                  setPopupBloqueado(true);
                } else {
                  setPopupBloqueado(false);
                }

              }}
            >
              {arquivo.name || arquivo.titulo_arquivo}{/* local || bd */}
            </span>

            <span className={classes.divisor}></span>

            <span
              title='Remover arquivo'
              onClick={removerArquivo}
              className={classes.arquivoRemover}
            >
              x
            </span>

          </div>

          {popupBloqueado && (
            <div className={classes.avisoErro}>
              ⚠️ O navegador bloqueou a abertura da nova aba. Permita pop-ups para baixar o arquivo.
            </div>
          )}

        </>

      )}

    </div>
  );
};

export default GerenciadorDeArquivo;
