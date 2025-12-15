import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import DirinfraCardHeader from '../../components/DirinfraCard/DirinfraCardHeader';
import DirinfraCard from '../../components/DirinfraCard/DirinfraCard';
import DirinfraCardBody from '../../components/DirinfraCard/DirinfraCardBody';

//import GerenciadorCrud from '../../components/GerenciadorCrud/GerenciadorCrud';

const BasicPage = (props) => {
  const location = useLocation();
  const [subPagina, setSubPagina] = useState();

  useEffect(() => {
    let subpagina;
    const pathElements = location.pathname// ['main', 'index/docs/planinfra', 'cadastrar/editar/listar', 'coleção', 'id']
      .split('/')//separa
      .filter(element => element);//remove vazios

    const preSubpagina = pathElements[2];
    const fluxo = pathElements[1];//'planinfra' ou 'docs'
    // const colecao = pathElements[3];
    // const id = pathElements[4];

    const listaSubstituicoes = ['cadastrar', 'editar', 'listar', 'editardemanda'];
    const listaSubstitutosTCelCordovil = fluxo === 'planinfra' ?
      ['cadastrar documento', `editar`, 'buscar documento', 'editar demanda'] :
      ['numerar documento', 'editar documento', 'buscar documento'];

    const indice = listaSubstituicoes.indexOf(preSubpagina);

    //Se não for um dos termos pra substituir, insere o termo original. Em ambos os casos, formata
    subpagina = (listaSubstitutosTCelCordovil[indice] || preSubpagina)?.toLocaleUpperCase();

    setSubPagina(subpagina);
  }, [location.pathname]);

  return (
    <DirinfraCard>
      <DirinfraCardHeader titulo={`${props.pagina || 'Principal'} ${subPagina ? '> '+subPagina : ''}`} />
      <DirinfraCardBody>
        {/* <GerenciadorCrud/> */}

        {
          /* Outlet serve para resolver rotas aninhadas,
             no caso, definidas dentro do layout Main.jsx (quando há subrotas),
             como para este componente.
          */
        }
        <Outlet />
      </DirinfraCardBody>
    </DirinfraCard>
  );
};

export default BasicPage;