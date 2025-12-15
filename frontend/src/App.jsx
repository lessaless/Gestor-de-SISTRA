import axios from "axios";
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";
import 'react-toastify/dist/ReactToastify.css';

import Main from "./layouts/Main/Main";//Layout Principal
import Popup from "./layouts/Popup/Popup";
import NotFoundPage from "./pages/notfound-page/notfound-page";

axios.defaults.withCredentials = true

//Reload em contexto global da aplicação
window.atualizarPagina = function atualizarPagina() {
  window.location.reload();//usada ao salvar em pop-ups
};

//Formatar as datas para o formulário string > Date > ISOString
window.dataParaFormulario = function dataParaFormulario(obj) {
  // Regex para verificar o formato de datas ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:MM:SSZ)
  const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z)?$/;

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      let value = obj[key];

      // Verifica se o valor é uma string e se corresponde ao regex de uma data
      if (typeof value === 'string' && dateRegex.test(value)) {
        let date = new Date(value);
        // Verifica se a conversão para data é válida
        if (!isNaN(date.getTime())) {
          // Formata a data e a salva no formato YYYY-MM-DD
          obj[key] = date.toISOString().split('T')[0];
        }
      }
    }
  }
};


const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/main/*" element={<Main />} />
        <Route path="/popup/*" element={<Popup />} />
        <Route path="/" element={<Navigate replace to="/main/index" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App;
