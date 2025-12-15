import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import DirinfraCardHeader from '../../components/DirinfraCard/DirinfraCardHeader';
import DirinfraCard from '../../components/DirinfraCard/DirinfraCard';
import DirinfraCardBody from '../../components/DirinfraCard/DirinfraCardBody';

const GeraisPage = () => {
  const location = useLocation();
  const [subPagina, setSubPagina] = useState();

  useEffect(() => {
    let subpagina;
    const pathElements = location.pathname
      .split('/')//separa
      .filter(element => element);//remove vazios
    
      //const nElements = pathElements.length;
    /* if (nElements <= 3) {
      subpagina = `> ${pathElements[nElements - 1]
        .toLocaleUpperCase()}`;
    } else {
      subpagina = `> ${pathElements[nElements - 3]
        .toLocaleUpperCase()} > ${pathElements[nElements - 2]
          .toLocaleUpperCase()} > ${pathElements[nElements - 1]}`;
    } */

    subpagina = `> ${pathElements[2].toLocaleUpperCase()}`;

    setSubPagina(subpagina);
  }, [location.pathname]);

  return (
    <DirinfraCard>
      <DirinfraCardHeader titulo={`Documentos Independentes ${subPagina}`} />
      <DirinfraCardBody>
        <Outlet />
      </DirinfraCardBody>
    </DirinfraCard>
  );
};

export default GeraisPage;