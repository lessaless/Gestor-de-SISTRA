import React from 'react';
import DirinfraCard from '../../components/DirinfraCard/DirinfraCard';
import DirinfraCardHeader from '../../components/DirinfraCard/DirinfraCardHeader';
import DirinfraCardBody from '../../components/DirinfraCard/DirinfraCardBody';
import logo from '../../imgs/logo/logo-branco.png';


const estilo = {
    conteudo: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '20px'
    },

    textoTopo: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        lineHeight: '40px',
        width: '100%',
        textAlign: 'center'
    },

    imagem: {
        marginTop: '30px',
        filter: 'drop-shadow(0px 0px 1px var(--color-shadow))',
        width: '15rem'
    },

    descricao: {
        color: 'var(--color-font4light)',
        fontSize: '1.1em',
        lineHeight: '1.6em',
        marginTop: '20px',
        /* maxWidth: '600px', */
        textAlign: 'justify',
        textIndent: '50px',
    },

    // table: {
    //     width: '60%',
    //     margin: 'auto',
    //     borderCollapse: 'collapse',
    // },
    // td: {
    //     border: '1px solid black',
    //     padding: '8px',
    //     textAlign: 'center',
    // },
    // th: {
    //     border: '1px solid black',
    //     padding: '8px',
    //     textAlign: 'center',
    //     backgroundColor: '#f4f4f4',
    // }
    logo: { // aqui testo para identificar a saída da imagem
        height: '300px',
        width: '300px',
        backgroundColor: 'var(--color-logo1)',
        background: 'radial-gradient(circle, var(--color-logo1) 25%, var(--color-logo2) 100%)',
        maskImage: `url(${logo})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center'
    }
};

const HomePage = () => {

    
    return (
        <DirinfraCard>
            {/* <DirinfraCardHeader /> */}
            <DirinfraCardBody>

                <div style={estilo.conteudo}>

                    {/* <div style={estilo.textoTopo}>
                        <h2>
                            {`${process.env.REACT_APP_TITULO}`}: Bem vindo(a)!
                        </h2>
                    </div> */}

                    {/* <img src={logo} style={estilo.imagem} /> */}
                    <div style={estilo.logo}/>

                    <p style={estilo.descricao}>
                        Bem-vindo(a) ao <strong>{process.env.REACT_APP_TITULO}</strong>, o seu portal de conhecimento técnico e documentos especializados. Explore e encontre informações valiosas para impulsionar suas pesquisas e projetos.
                    </p>

                    

                </div>

            </DirinfraCardBody>
        </DirinfraCard>
    );
};

export default HomePage;
