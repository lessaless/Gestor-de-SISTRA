import React from 'react';
import DirinfraCard from '../../components/DirinfraCard/DirinfraCard';
import DirinfraCardHeader from '../../components/DirinfraCard/DirinfraCardHeader';
import DirinfraCardBody from '../../components/DirinfraCard/DirinfraCardBody';
import Contato from '../../components/Contato/Contato';
// import EPADrao from '../../components/EPADrao/EPADrao';

const ContactPage = () => {

  return (
    <DirinfraCard>
      <DirinfraCardHeader titulo="Página de Contato" />
      <DirinfraCardBody>
        <Contato />
        {/* <EPADrao /> */}
      </DirinfraCardBody>
    </DirinfraCard>
  );
};

export default ContactPage;