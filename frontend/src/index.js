import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import PreApp from './PreApp';
import AppInaugural from './AppInaugural';


document.title = `DIRINFRA | ${process.env.REACT_APP_TITULO}`;

const root = ReactDOM.createRoot(document.getElementById('root'));
const user = window.__USER__;


const isPreCadastro = (user && user.status === "precadastro") || (process.env.REACT_APP_PRECADASTRO === "true");

// Data de liberação no formato DD/MM/AAAA
const dataLiberacaoStr = process.env.REACT_APP_DATA_LIBERACAO;
let isAntesDaInauguracao = false;
if(dataLiberacaoStr) {
  const [dia, mes, ano] = dataLiberacaoStr.split('/');
  const dataLiberacao = new Date(`${ano}-${mes}-${dia}T00:00:00-03:00`);
  const agora = new Date();
  isAntesDaInauguracao = agora < dataLiberacao;
}

// Verifica se ainda não chegou na data de liberação

const renderizar = isAntesDaInauguracao
  ? <AppInaugural />
  : isPreCadastro
    ? <PreApp />
    : <App />;

root.render(
  <React.StrictMode>
    {renderizar}
  </React.StrictMode>
);
