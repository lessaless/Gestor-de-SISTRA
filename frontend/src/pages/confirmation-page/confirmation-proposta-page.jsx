import React from 'react';
import { useLocation } from 'react-router-dom';
import DirinfraCard from '../../components/DirinfraCard/DirinfraCard';
import DirinfraCardHeader from '../../components/DirinfraCard/DirinfraCardHeader';
import DirinfraCardBody from '../../components/DirinfraCard/DirinfraCardBody';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ConfirmationPage = () => {
  const query = useQuery();
  const idProposta = query.get('id_proposta');
  if(!idProposta) return window.location.href = '/';

  return (
   /*  <div style={styles.container}> */
      <DirinfraCard style={styles.card}>
        <DirinfraCardHeader titulo="Confirmação Estudo Técnico Preliminar de Engenharia" style={styles.header} />
        <DirinfraCardBody style={styles.body}>
          <div style={styles.iconContainer}>
            <svg style={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green" width="48px" height="48px">
              <path d="M0 0h24v24H0V0z" fill="none" />
              <path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 5.37 12 12 12 6.63 0 12-5.37 12-12 0-6.63-5.37-12-12-12zm-1.24 17.32l-4.59-4.59 1.41-1.41 3.18 3.18 6.36-6.36 1.41 1.41-7.77 7.77z" />
            </svg>
          </div>
          <h2 style={styles.title}>Proposta PLANINFRA Registrada com Sucesso!</h2>
          <p style={styles.message}>
            O identificador da Proposta é: <span style={styles.id}>{idProposta}</span>.
          </p>
          <p style={styles.note}>Por favor, anote esse código para referência futura.</p>
          <div style={styles.buttonContainer}>
            <button className='btn' style={styles.button} onClick={() => window.location.href = '/main/planinfra/listar/propostas'}>
              Ir para a Lista de Propostas
            </button>
          </div>
        </DirinfraCardBody>
      </DirinfraCard>
   /*  </div> */
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    paddingTop: '20px',
  },
  card: {
    width: '50%',
    minWidth: '300px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  header: {
    marginBottom: '20px',
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: '20px',
  },
  icon: {
    fill: 'green',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  message: {
    fontSize: '18px',
    marginBottom: '10px',
  },
  id: {
    fontWeight: 'bold',
  },
  note: {
    fontSize: '14px',
    color: 'gray',
    marginBottom: '20px',
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  button: {
    width: '20%',
    minWidth: '220px',
  },
};

export default ConfirmationPage;
