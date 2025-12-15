import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import Loading from '../../components/Loader/Loading';
import Permissoes from '../../components/Permissoes/Permissoes';

import permissaoService from '../../services/permissaoService';

const PermissoesPage = () => {

  const [isLoading, setIsLoading] = useState(true);
  const [redirecionarLogin, setRedirecionarLogin] = useState(false);


  useEffect(() => {
    const aoCarregarPagina = async () => {
      try {
        const resp = await permissaoService.Autorizar();
        //console.log(resp.data);

        if (resp.status === 200) setIsLoading(false);
        else setRedirecionarLogin(true);

      } catch (erro) {
        console.error(erro);
        toast.error(erro);
        setIsLoading(false);
        setRedirecionarLogin(true);
      }
    }
    aoCarregarPagina();
  }, []);

  // if (redirecionarLogin) return window.location.href = `/`;
  if (redirecionarLogin) return <Navigate to="/" />;

  return (

    <div>
      {isLoading ?
        <Loading personalizarEstilo={{ height: '100vh', width: '100%', backgroundColor: 'var(--color-bg2)' }} /> :
        <Permissoes />
      }
    </div>
  );
};

export default PermissoesPage;