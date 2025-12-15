import React from "react";
import axios from "axios";
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import "./App.css";
import 'react-toastify/dist/ReactToastify.css';


import NotFoundPage from "./pages/notfound-page/notfound-page";
// import BasicPage from "./pages/basic-page/basic-page";
import PreCadastro from "./components/PreCadastro/PreCadastroUser";

axios.defaults.withCredentials = true


class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/precadastro" />} />
          <Route path="/precadastro" element={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}>
              <Outlet />
              {/* <BasicPage pagina="Pré-cadastro" /> */}
            </div>}
          >
            <Route index element={<PreCadastro />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    )
  }
}

export default App;
