import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  main: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '5px',
    width: '100%',
    position: 'relative'
  },
  divInput: {
    position: 'relative',
  },
  inputDirinfra: {
    display: 'flex',
    backgroundColor: 'var(--color-bg1)',
    borderRadius: '5px',
    border: 'solid 1px',
    color: 'var(--color-font4light)',
    padding: '5px',
    fontSize: '.9rem',
    fontWeight: '500',
    position: 'relative',
    width: '100%',

    '&:focus, &:focus-visible': {
      outline: 'none !important',
      borderColor: 'var(--color-borderfocus)',
    },
    '&:disabled': {
      backgroundColor: 'var(--color-disabled)'
    },
    '&::placeholder': {
      fontStyle: 'italic',
      color: 'var(--color-placeholder)',
      textAlign: 'left',
      whiteSpace: 'normal',
      flexWrap: 'wrap',
      wordBreak: 'break-word',
    }
  },
  inputDirinfraOk: {
    borderColor: 'var(--color-borderdefault)',
    '&:focus, &:focus-visible': {
      borderColor: 'var(--color-borderfocus)'
    }
  },
  inputDirinfraErro: {
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
  opcoesMenuLista: {
    backgroundColor: 'var(--color-bg1)',
    border: '1px solid var(--color-borderdefault)',
    borderRadius: '5px',
    boxShadow: '0px 4px 20px 0px var(--color-shadow)',
    listStyleType: 'none',
    margin: 0,
    maxHeight: '150px',
    overflowY: 'auto',
    padding: 0,
    position: 'absolute',
    top: '100%',  // ← ADD THIS to position it right below the input
    left: 0,      // ← ADD THIS to align it with the left edge
    width: '100%', // ← CHANGE from '65%' to '100%'
    zIndex: 1000
  },
  opcoesMenuItem: {
    cursor: 'pointer',
    padding: '8px',
    '&:hover': {
      backgroundColor: 'var(--color-borderfocus)',
      color: 'var(--color-font4dark)'
    }
  }
});

const buscarErro = (objErros, propsName) => {
  return objErros[propsName] || propsName
    .split('.')
    .reduce((acc, part) => acc && acc[part], objErros);
};

const DirinfraListSelectGC = ({ name, label, options, required, erros, registro, setValue, watch, ...props }) => {
  console.log(`DirinfraListSelectGC [${name}] - Received options:`, options);
  console.log(`DirinfraListSelectGC [${name}] - Options length:`, options?.length);
  if (!setValue) {
    console.error("SETVALUE É OBRIGATÓRIO no componente de nome:", name)
  }
  if (!watch) {
    console.error("WATCH É OBRIGATÓRIO no componente de nome:", name)
  }

  const classes = useStyles();
  const watchInput = watch(name);

  const temErro = erros && buscarErro(erros, name);

  const [termoDigitado, setTermoDigitado] = useState('');
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null);
  const [mostrarOpcoes, setMostrarOpcoes] = useState(false);
  const registroProps = registro && registro(name, { required: required });

  useEffect(() => {
    const valor = watchInput;
    if (valor === undefined) return;//é undefined quando não houve interação no campo ainda
    setTermoDigitado(valor);
    if (opcaoSelecionada) setOpcaoSelecionada(null);//quando digita reseta a seleção se existir
  }, [watchInput]);


  const aoClicarOpcoes = async (opcao) => {
    setValue(name, opcao.label, { shouldValidate: true, shouldDirty: true });
    const fakeEvent = {
      target: {
        name,
        value: opcao.label
      }
    };

    if (registroProps.onChange) {
      await registroProps.onChange(fakeEvent);
    }
    if (props.onChange) {
      await props.onChange(fakeEvent);
    }
    setMostrarOpcoes(false);
    setOpcaoSelecionada(opcao);

  };



  const aoDesfocar = async (event) => {
    if (registroProps.onBlur) await registroProps.onBlur(event);
    if (props.onBlur) await props.onBlur(event);

    setMostrarOpcoes(false);
    if ((!opcaoSelecionada?.value) && (watchInput !== '')) {
      setTermoDigitado('');
      setValue(name, '', { shouldValidate: true, shouldDirty: false });
      // Reseta o valor, valida o campo e marca como 'limpo'
    }
  };


  const aoFocar = async (event) => {
    if (registroProps.onFocus) await registroProps.onFocus(event);
    if (props.onFocus) await props.onFocus(event);

    setMostrarOpcoes(true);
  };

  // Padronizar opções para garantir que todas têm `label` e `value`
  const opcoesFormatadas = options.map(opcao =>
    typeof opcao === 'string'
      ? { label: opcao, value: opcao } // Transformar string em objeto
      : opcao // Manter objetos já no formato correto
  );

  // Opções que aparecerão na lista conforme o digitado. É atualizada a cada caractere inserido (watch)
  const opcoesFiltradas = opcoesFormatadas.filter(opcao =>
    /* opcao.label.toLowerCase().includes(termoDigitado?.toLowerCase()) */
    opcao.label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .includes(
        termoDigitado
          ?.toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      )
  );

  const destacarTexto = (texto, termo) => {// Destaca (sublinha) nas opções filtradas os caracteres que correspondem ao digitado
    if (!termo) return texto;

    // Remover acentos do termo e texto
    const termoNormalizado = termo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const textoNormalizado = texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Criar expressão regular para o termo normalizado
    const partes = textoNormalizado.split(new RegExp(`(${termoNormalizado})`, 'gi'));

    let index = 0;

    return partes.map((parte) => {
      const originalPart = texto.slice(index, index + parte.length);
      index += parte.length;

      return parte.toLowerCase() === termoNormalizado ? <u key={index}>{originalPart}</u> : originalPart;
    });
  };


  return (
    <div className={`${classes.main} ${props.className || ''}`}>
      <label className={classes.labelDirinfra} style={{ width: '30%' }}>
        {label || name}
      </label>

      <div className={classes.divInput} style={{ width: props.l ? `${props.l}px` : '65%' }}>
        <input
          autoComplete="off"// desativar dicas do navegador (atrapalham a ver a lista)
          className={`${classes.inputDirinfra} ${temErro ? classes.inputDirinfraErro : classes.inputDirinfraOk}`}
          type="text"
          placeholder={props.placeholder || '<Digite para filtrar e/ou selecione>'}
          {...props}
          {...registroProps}
          onFocus={aoFocar}
          onBlur={aoDesfocar}
        /* 
        NÃO MUDAR A ORDEM DAS PROPRIEDADES OU REMOVÊ-LAS
        Após alguns dias de muitas tentativas, funcionou quando todos os astros se alinharam e as propriedades estavam assim...
        */
        />

        {mostrarOpcoes && (
          <>
            {/* ADD THESE LOGS */}
            {console.log(`RENDERING DROPDOWN - mostrarOpcoes: ${mostrarOpcoes}`)}
            {console.log(`RENDERING DROPDOWN - opcoesFiltradas:`, opcoesFiltradas)}
            {console.log(`RENDERING DROPDOWN - opcoesFiltradas.length:`, opcoesFiltradas.length)}
            <ul className={classes.opcoesMenuLista}>
              {opcoesFiltradas.map((opcao, index) => (
                <li
                  className={classes.opcoesMenuItem}
                  key={index}
                  onMouseDown={() => aoClicarOpcoes(opcao)}
                >
                  {/* {opcao.label} */}
                  {destacarTexto(opcao.label, termoDigitado)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default DirinfraListSelectGC;
