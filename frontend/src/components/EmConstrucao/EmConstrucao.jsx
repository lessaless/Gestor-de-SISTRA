import React from 'react';
import { Link } from 'react-router-dom'

const EmConstrucao = ({ titulo, mensagem }) => {
    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>{titulo || 'Em construção'}</h1>
            <br /><br />
            <p style={styles.paragraph}>
                {mensagem || <>
                    <span>
                        Página em construção. Se precisar de ajuda, <Link to="/main/help">entre em contato</Link>.
                    </span>
                </>
                }
            </p>
            <img src="/emObras.png" alt="Em obras" style={styles.image} />
        </div>
    );
};

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center',
        padding: '50px',
    },
    heading: {
        color: '#FF0000',
    },
    paragraph: {
        color: '#444',
        fontSize: '20px',
    },
    image: {
        marginTop: '40px',
    },
};

export default EmConstrucao;
