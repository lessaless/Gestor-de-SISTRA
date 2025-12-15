import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { makeStyles } from '@material-ui/core/styles';

// Estilos com makeStyles
const useStyles = makeStyles({
    concordarOverlay: {
        backgroundColor: '#000000bd',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
    },
    concordarContainer: {
        backgroundColor: 'whitesmoke',
        padding: '40px',
        borderRadius: '5px',
        boxShadow: '0 0 20px #000000d1',
        width: '76%',
        maxWidth: '800px',
        height: 'fit-content',
        color: '#757575',
        fontWeight: 500,
        maxHeight: '80vh', // <--- LIMITA A ALTURA DO CONTAINER
        overflowY: 'auto',  // <--- PERMITE ROLAGEM INTERNA
        textAlign: 'justify',
        margin: '20px auto',
        border: 'solid 10px whitesmoke'
    },
    titulo: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        fontSize: '1.2rem',
        fontWeight: 600,
        margin: '0 auto 40px'
    },
    ppSecao: {
        fontSize: '1.0rem',
        fontWeight: 600,
        textIndent: 0,
        width: '100%',
        display: 'flex',
        margin: '25px 0 10px'
        /* justifyContent: 'center' */
    },
    ppParagrafo: {
        fontSize: '1rem',
        lineHeight: '1.4rem',
        /* margin: '10px', */
        textIndent: '2rem',
    },
    confirmarButtons: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '60px',
        gap: '20px'
    },
    /* confirmarButton: {
        
    }, */
    cancelarButton: {
        filter: 'invert(1)'
    },
});

const PDPModal = ({ titulo, mensagem, btFalseName, btTrueName, onConfirm, onCancel }) => {
    const classes = useStyles();

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onCancel();
            }
        };
        // Ao abrir, trava o scroll do body
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            // Ao fechar, restaura o scroll do body
            document.body.style.overflow = originalStyle;

            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onCancel]);

    return (
        <div
            className={classes.concordarOverlay}
            onWheel={(e) => {//Evitar que acione o scroll do componente pai
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <div className={classes.concordarContainer}>

                <h1 className={classes.titulo}>POLÍTICA DE PRIVACIDADE</h1>

                <h5 className={classes.ppSecao}>SEÇÃO 1 - INFORMAÇÕES GERAIS</h5>
                <p className={classes.ppParagrafo}>
                    A presente Política de Privacidade contém informações sobre coleta, uso, armazenamento, tratamento e proteção dos dados pessoais dos usuários dos sistemas do Portal DIRINFRA, com a finalidade de demonstrar absoluta transparência quanto ao assunto e esclarecer a todos os interessados sobre os tipos de dados que são coletados e os motivos da coleta.
                </p>
                <p className={classes.ppParagrafo}>
                    Esta Política de Privacidade aplica-se a todos os usuários e visitantes dos sistemas do Portal DIRINFRA.
                </p>
                <p className={classes.ppParagrafo}>
                    O presente documento foi elaborado em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei 13.709/18), o Marco Civil da Internet (Lei 12.965/14) e o Regulamento da UE n. 2016/679.
                </p>

                <h5 className={classes.ppSecao}>SEÇÃO 2 - COMO SÃO COLETADOS OS DADOS PESSOAIS DO USUÁRIO E DO VISITANTE?</h5>
                <p className={classes.ppParagrafo}>
                    Os dados são recolhidos após autenticação via Login Único da FAB, onde são buscados CPF ou e-mail, nome, SARAM, posto e OM, além de outras interações registradas durante o uso da plataforma.
                </p>

                <h5 className={classes.ppSecao}>SEÇÃO 3 – QUAIS OS DADOS SÃO RECOLHIDOS?</h5>
                <p className={classes.ppParagrafo}>
                    - Dados de conta: e-mail, nome completo, SARAM; e
                </p>
                <p className={classes.ppParagrafo}>
                    - Dados profissionais: posto, quadro, especialidade, data de promoção, conselho de classe, OM, ativo ou reserva, interesses, especialidades, perfil DISC, línguas, graduações, cursos, experiência, atividades de destaque, níveis de conhecimento.
                </p>

                <h5 className={classes.ppSecao}>SEÇÃO 4 - PARA QUAIS FINALIDADES SÃO UTILIZADOS OS DADOS?</h5>
                <p className={classes.ppParagrafo}>
                    - Gestão do perfil e funcionalidades da plataforma;
                </p>
                <p className={classes.ppParagrafo}>
                    - Atualização do banco de competências da DIRINFRA;
                </p>
                <p className={classes.ppParagrafo}>
                    - Melhoria dos serviços; e
                </p>
                <p className={classes.ppParagrafo}>
                    - Envio de comunicações institucionais.
                </p>

                <h5 className={classes.ppSecao}>SEÇÃO 5 - POR QUANTO TEMPO OS DADOS SÃO ARMAZENADOS?</h5>
                <p className={classes.ppParagrafo}>
                    Pelo tempo necessário para as finalidades previstas, podendo ser mantidos nas hipóteses do art. 16 da LGPD.
                </p>

                <h5 className={classes.ppSecao}>SEÇÃO 6 - SEGURANÇA DOS DADOS PESSOAIS</h5>
                <p className={classes.ppParagrafo}>
                    A plataforma aplica medidas técnicas e organizativas para proteção dos dados. As senhas não são armazenadas. Em caso de violações, os usuários serão notificados conforme o art. 48 da LGPD.
                </p>

                <h5 className={classes.ppSecao}>SEÇÃO 7 - COMPARTILHAMENTO DOS DADOS</h5>
                <p className={classes.ppParagrafo}>
                    Os dados serão acessados apenas por usuários privilegiados dentro da FAB e sob termo de responsabilidade.
                </p>

                <h5 className={classes.ppSecao}>SEÇÃO 8 - OS DADOS SERÃO TRANSFERIDOS A TERCEIROS?</h5>
                <p className={classes.ppParagrafo}>
                    Não. Os dados não serão compartilhados com terceiros.
                </p>

                <h5 className={classes.ppSecao}>SEÇÃO 9 – COOKIES OU DADOS DE NAVEGAÇÃO</h5>
                <p className={classes.ppParagrafo}>
                    A plataforma utiliza cookies para melhorar a navegação e serviços. O usuário pode configurar o navegador para recusá-los, podendo haver limitação de funcionalidades.
                </p>

                <h5 className={classes.ppSecao}>SEÇÃO 10 - CONSENTIMENTO</h5>
                <p className={classes.ppParagrafo}>
                    O uso da plataforma implica consentimento com esta política, sendo possível cancelar o cadastro e atualizar os dados a qualquer momento.
                </p>

                <h5 className={classes.ppSecao}>SEÇÃO 11 - ALTERAÇÕES PARA ESSA POLÍTICA</h5>
                <p className={classes.ppParagrafo}>
                    A política pode ser atualizada. Os usuários serão notificados e poderá ser solicitado novo consentimento quando necessário.
                </p>

                <h5 className={classes.ppSecao}>SEÇÃO 12 – JURISDIÇÃO PARA RESOLUÇÃO DE CONFLITOS</h5>
                <p className={classes.ppParagrafo}>
                    Para resolver controvérsias, deve-se consultar a Seção de Análise de Dados da DIRINFRA.
                </p>



                <div className={classes.confirmarButtons}>
                    <button className={`${classes.confirmarButton} ${classes.cancelarButton}`} onClick={onCancel}>
                        {btFalseName || 'Discordo'}
                    </button>
                    <button /* autoFocus  */className={classes.confirmarButton} onClick={onConfirm}>
                        {btTrueName || 'Concordo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PoliticaDePrivacidade = (titulo, mensagem, btFalseName, btTrueName) => {
    return new Promise((resolve) => {
        const portalDiv = document.createElement('div');
        document.body.appendChild(portalDiv);

        const handleClose = () => {
            resolve(false);
            root.unmount(); // Desmonta a raiz criada
            document.body.removeChild(portalDiv);
        };

        const handleConfirm = () => {
            resolve(true);
            root.unmount(); // Desmonta a raiz criada
            document.body.removeChild(portalDiv);
        };

        const root = ReactDOM.createRoot(portalDiv); // Cria a raiz
        root.render(
            <PDPModal
                titulo={titulo}
                mensagem={mensagem}
                btFalseName={btFalseName}
                btTrueName={btTrueName}
                onConfirm={handleConfirm}
                onCancel={handleClose}
            />
        );
    });
};

export default PoliticaDePrivacidade;