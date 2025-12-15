import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { toast } from 'react-toastify';

import OMs_SISENG from '../../utils/OMs_SISENG';
import userService from '../../services/userService';
import PoliticaDePrivacidade from '../PoliticaPrivacidade/PoliticaDePrivacidade';

import '../../utils/NiceScrool';//rolar para baixo/cima após clique de rolagem

// import bg from '../../imgs/bg0.jpg';
import bg from '../../imgs/eng.jpeg';
import logoFAB from '../../imgs/icon_FAB.png';
import logoDIRINFRA from '../../imgs/domDIRINFRA.png';

import LogoutIcon from '@mui/icons-material/Logout';


const AZUL_SIGADAER = "#171544";
const AZUL_ULTRAMAR = "#003d6e";
const divEsquerdoX = "60%";
const divDireitoX = "40%";

const useStyles = makeStyles((theme) => ({
  topBar: {
    backgroundColor: AZUL_SIGADAER,
    color: 'white',
    height: '57px',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  logoFAB: {
    margin: '6px',
    width: '40px',
    height: '40px',
  },
  logoDIRINFRA: {
    /* width: '100px', */
    height: '200px',
    objectFit: 'contain',
  },
  divTextos: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    /* alignItems: 'center', */
    /* textAlign: 'center', */
    padding: '50px',
    /* width: '30%', */
  },
  span1: {
    margin: '10px 0',
    fontSize: '3rem',
    fontWeight: 'bold',
    color: AZUL_SIGADAER,
    fontStyle: 'italic',
  },
  p0: {
    fontStyle: 'italic',
    margin: '15px 0',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: AZUL_SIGADAER,
  },
  p1: {
    fontStyle: 'italic',
    margin: '15px 0',
    fontSize: '1.2rem',
    color: AZUL_SIGADAER,
  },

  Container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    backgroundColor: 'ghostwhite',
    /* overflowX: 'hidden', */

    '@media (max-width: 1400px)': {
      /* flexDirection: 'column', */
      height: 'inherit',
    }
  },
  divEsquerdo: {
    background: `url(${bg}) center center / cover no-repeat`,

    boxShadow: 'inset -10px 0px 30px -10px #8b8b8b',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(6px)',
    width: divEsquerdoX,
    minWidth: '700px',
    height: '100vh',
    flexDirection: 'column',
    '@media (max-width: 1400px)': {
      boxShadow: 'inset 0px -10px 30px -10px #8b8b8b',
      width: '100%',
      minWidth: '100%'
    }
  },
  divDireito: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AZUL_ULTRAMAR,
    backdropFilter: 'blur(10px)',
    width: divDireitoX,
    minWidth: '560px',
    height: '100vh',
    '@media (max-width: 1400px)': {
      width: '100%',
      minWidth: '100%',
    }
  },
  Content: {
    backgroundColor: '#ffffffa0',
    backdropFilter: 'blur(2px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    position: 'absolute',
    top: '57px',
    height: 'calc(100vh - 57px)',
    overflowY: 'auto',
  },

  tituloForm: {
    textAlign: 'center',
    marginBottom: '5px',
    fontSize: '1.2rem',
  },
  formContainer: {
    margin: 'auto',
    padding: '30px',
    border: '1px solid #e0e0e0',
    borderRadius: 10,
    backgroundColor: '#fff',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',

    maxWidth: 'min-content',
    boxSizing: 'border-box',
    overflowWrap: 'break-word'
  },

  divElement: {
    marginTop: '10px',
    '& > label': {
      fontSize: '12px',
    }
  },

  formElement: {
    fontSize: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    border: '1px solid #ccc',
    padding: '10px',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '4px',

    '&:disabled': {
      backgroundColor: '#e0e0e0',
      cursor: 'not-allowed',
      color: '#666',
    }
  },
  submitButton: {
    marginTop: theme.spacing(3),
    padding: '20px',
    fontWeight: 'bold',
    textTransform: 'none',
    borderRadius: 6,
    border: 'none',
    backgroundColor: AZUL_SIGADAER,
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  divPP: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
  },
  spanPP: {
    userSelect: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    '& > a': { fontSize: '12px' }
  },
  logout: {
    display: 'flex',
    justifyContent: 'end',
    alignItems: 'center',
    marginTop: '15px',
  },
  spanLogout: {
    display: 'flex',
    color: AZUL_SIGADAER,
    fontSize: '0.8rem',
    alignItems: 'center',
    gap: '5px',
    userSelect: 'none',
    cursor: 'pointer'
  },
  formRow: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'space-between',
    /* flexWrap: 'wrap' */
  },
  halfWidth: {
    width: '48%',
    minWidth: '240px'
  }
}));

const OMs = OMs_SISENG;
const ordemPostos = [
  "s2", "s1", "cb", "3s", "2s", "1s", "so", "ap",
  "2t", "1t", "cp", "mj", "tc", "cl", "br", "mb", "tb"
];


const PreCadastro = () => {

  const classes = useStyles();
  const userInjected = window.__USER__ || {};

  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [ppClicada, setPPClicada] = useState(false);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    posto: userInjected.posto || '',
    nome: userInjected.nome || '',
    email: userInjected.email || '',
    cpf: userInjected.cpf ? 'autenticado' : '',
    SARAM: userInjected.SARAM || '',
    OM: userInjected.OM || '',
    quadro: userInjected.quadro || '',
    esp: userInjected.esp || '',
    ult_promo: userInjected || '',
    PoliticaDePrivacidade: false,
  });


  useEffect(() => {
    const verificarPreCadastro = async () => {
      try {
        const existente = await userService.verificarPreCadastro({
          email: userInjected.email,
          cpf: userInjected.cpf
        });
        if (existente?.status === 200) {
          setSubmitted(true);
          setUser(existente.data);
          setIsLoading(false);
        }

      } catch (error) {
        console.error("Erro ao verificar pré-cadastro:", error);
        setIsLoading(false);

      }
    }

    if (userInjected) verificarPreCadastro();
  }, []);


  const aoAlterar = (e) => {
    const { name, value, type, checked } = e.target;
    const upperCaseFields = ['quadro', 'esp'];

    const finalValue =
      type === 'checkbox'
        ? checked
        : upperCaseFields.includes(name)
          ? value.toUpperCase()
          : value;

    setForm({
      ...form,
      [name]: finalValue
    });

  };

  const abrirPDP = async () => {
    const resposta = await PoliticaDePrivacidade(); // Função que abre o modal e retorna a resposta do usuário

    if (!ppClicada) {
      setPPClicada(true);
    }

    setForm(prev => ({
      ...prev,
      PoliticaDePrivacidade: resposta
    }));
  };

  const aoEnviar = async (e) => {
    e.preventDefault();
    if (!form.PoliticaDePrivacidade) {
      toast.warn("Você deve aceitar a Política de Privacidade.");
      return;
    }

    try {
      const resp = await userService.preRegister(form);
      if (resp?.status === 201) {
        toast.success(resp.data.message);
        setSubmitted(true);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logoutElement = () => (
    <div className={classes.logout}>
      <span className={classes.spanLogout} onClick={() => window.location.href = `${process.env.REACT_APP_BACKEND}/logout`}>
        <LogoutIcon />
        Deslogar
      </span>
    </div>
  );


  if (isLoading) {
    return (
      <div className={classes.formContainer} style={{ textAlign: 'center', maxWidth: 'unset' }}>
        <h5>Carregando...</h5><br />
        <p>Por favor, aguarde enquanto verificamos seus dados.</p>
      </div>
    );
  }

  if (submitted) {

    if (user) {
      return (
        <div className={classes.formContainer} style={{ textAlign: 'center', maxWidth: 'unset' }}>
          <h5>Olá, {user.POSTO + ' ' + user.NOME}!</h5><br />
          <p>Seu pré-cadastro já foi realizado e entraremos em contato assim que validarmos os dados.</p>
          {logoutElement()}
        </div>
      )

    } else return (
      <div className={classes.formContainer} style={{ textAlign: 'center', maxWidth: 'unset' }}>
        <h5>Pré-cadastro enviado com sucesso!</h5><br />
        <p>Entraremos em contato após a validação dos dados.</p>
        {logoutElement()}
      </div>
    );
  }

  return (
    <div className={classes.Container}>

      <div className={classes.divEsquerdo}>

        <div className={classes.topBar}>
          <img src={logoFAB} alt="logoFAB" className={classes.logoFAB} />
        </div>

        <div className={classes.Content}>

          <img src={logoDIRINFRA} alt="logoDIRINFRA" className={classes.logoDIRINFRA} />

          <div className={classes.divTextos}>
            <span className={classes.span1}>
              Bem-vindo!
            </span>
            <p className={classes.p1}>
              Você já está autenticado no Login Único da FAB. Agora, só precisamos de algumas informações para concluir seu pré-cadastro no ecossistema DIRINFRA.
            </p>
            <p className={classes.p1}>
              Assim que validarmos os seus dados, entraremos em contato.
            </p>
            <p className={classes.p0}>
              Seção de Análise de Dados da DIRINFRA.
            </p>
          </div>
        </div>

      </div>

      <div className={classes.divDireito} >

        <form className={classes.formContainer} onSubmit={aoEnviar}>

          <h5 className={classes.tituloForm}>Pré-Cadastro</h5>

          <div className={classes.formRow}>

            <div className={`${classes.divElement} ${classes.halfWidth}`}>
              <label>Posto/Graduação</label>
              <select
                className={classes.formElement}
                name="posto"
                value={form.posto}
                onChange={aoAlterar}
                required
                disabled={!!userInjected.posto}
              >
                <option disabled value="">Selecione seu Posto/Graduação</option>
                {ordemPostos.slice().reverse().map(p => (
                  <option key={p} value={p.toUpperCase()}>{p.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className={`${classes.divElement} ${classes.halfWidth}`}>
              <label>Nome de Guerra</label>
              <input
                placeholder='(sem posto/graduação)'
                className={classes.formElement}
                name="nome"
                value={form.nome}
                onChange={aoAlterar}
                required
                disabled={!!userInjected.nome}
              />
            </div>

          </div>

          <div className={classes.formRow}>

            <div className={`${classes.divElement} ${classes.halfWidth}`}>
              <label>Quadro</label>
              <input
                placeholder='Ex.: QOCON / QOENG'
                className={classes.formElement}
                name="quadro"
                value={form.quadro}
                onChange={aoAlterar}
                required
                disabled={!!userInjected.quadro}
              />
            </div>

            <div className={`${classes.divElement} ${classes.halfWidth}`}>
              <label>Especialidade</label>
              <input
                placeholder='Ex.: CIV'
                className={classes.formElement}
                name="esp"
                value={form.esp}
                onChange={aoAlterar}
                required
                maxLength={6}
                minLength={3}
                disabled={!!userInjected.esp}
              />
            </div>

          </div>

          <div className={classes.formRow}>

            <div className={`${classes.divElement} ${classes.halfWidth}`}>
              <label>CPF</label>
              <input
                type={userInjected.cpf ? 'password' : 'text'}
                className={classes.formElement}
                name="cpf"
                value={form.cpf}
                onChange={aoAlterar}
                required
                maxLength={11}
                disabled={!!userInjected.cpf}
              />
            </div>

            <div className={`${classes.divElement} ${classes.halfWidth}`}>
              <label>SARAM (7 dígitos)</label>
              <input
                placeholder='SARAM'
                className={classes.formElement}
                name="SARAM"
                value={form.SARAM}
                onChange={aoAlterar}
                required
                pattern="\d{7}"
                maxLength={7}
                minLength={7}
                disabled={!!userInjected.SARAM}
              />
            </div>
          </div>

          <div className={classes.formRow}>
            <div className={`${classes.divElement} ${classes.halfWidth}`}>
              <label>OM</label>
              <select
                className={classes.formElement}
                name="OM"
                value={form.OM}
                onChange={aoAlterar}
                required
                disabled={!!userInjected.OM}
              >
                <option value="">Selecione uma OM</option>
                {OMs.map(om => (
                  <option key={om} value={om}>{om}</option>
                ))}
              </select>
            </div>

            <div className={`${classes.divElement} ${classes.halfWidth}`}>
              <label>Última Promoção</label>
              <input
                type="date"
                className={classes.formElement}
                name="ult_promo"
                value={form.ult_promo}
                onChange={aoAlterar}
                required
                disabled={!!userInjected.ult_promo}
              />
            </div>
          </div>


          <div className={classes.divElement}>
            <label>Email</label>
            <input
              className={classes.formElement}
              name="email"
              type="email"
              value={form.email}
              onChange={aoAlterar}
              required
              disabled={!!userInjected.email}
            />
          </div>

          <div className={classes.divElement + ' ' + classes.divPP}>
            <label>
              <input
                type="checkbox"
                name="PoliticaDePrivacidade"
                checked={form.PoliticaDePrivacidade}
                onChange={(e) => {
                  if (!ppClicada) {
                    e.preventDefault();
                    toast.warn("Você deve ler a Política de Privacidade antes de aceitar.");
                    return;
                  }
                  aoAlterar(e);
                }}
              />
              <span className={classes.spanPP}>
                {' '}Li e aceito a{' '}
                <a
                  href="#"
                  rel="noreferrer"
                  onClick={(e) => {
                    e.preventDefault(); // Evita navegação da âncora
                    abrirPDP();   // Chama a função
                  }}
                >
                  Política de Privacidade
                </a>
              </span>
            </label>
          </div>

          <button type="submit" className={classes.submitButton}>
            Enviar Pré-Cadastro
          </button>

          {logoutElement()}
        </form>

      </div>
    </div>
  );
};

export default PreCadastro;
