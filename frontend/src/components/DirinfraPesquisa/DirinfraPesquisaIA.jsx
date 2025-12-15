import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Search, SmartToy } from '@mui/icons-material';
import { toast } from 'react-toastify';
import verificarPadraoId from '../../utils/verificarPadraoId';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
    },
    input: {
        flex: 1,
        padding: '8px',
        border: '1px solid var(--color-borderdefault)',
        borderRadius: '4px',
        outline: 'none',
    },
    button: {
        background: 'var(--color-theme2)',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 12px',
        color: '#fff',
        cursor: 'pointer',
    },
    tabContainer: {
        display: 'flex',
        gap: '4px',
        padding: '0 8px 8px',
    },
    tab: {
        cursor: 'pointer',
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid var(--color-borderdefault)',
        background: '#fff',
    },
    activeTab: {
        background: 'var(--color-theme2)',
        color: '#fff',
        fontWeight: 'bold',
    },
    status: {
        paddingLeft: '8px',
        fontStyle: 'italic',
    }
});

/**
 * DirinfraPesquisa
 * @param {{ onFiltro: (filter: object) => void, onResultadoDireto: (dados: any[], viaIA?: boolean) => void, dados: any[] }} props
 */
const DirinfraPesquisa = ({ onFiltro, onResultadoDireto, dados }) => {
    const classes = useStyles();
    const [termo, setTermo] = useState('');
    const [modoIA, setModoIA] = useState(false);
    const [statusIA, setStatusIA] = useState('');
    const dadosOriginais = useRef(dados);

    useEffect(() => {
        dadosOriginais.current = dados;
    }, [dados]);

    const buscarTexto = () => {
        const t = termo.trim();
        let consulta = {};
        if (t) {
            consulta = verificarPadraoId(t)
                ? { id_gerais: t }
                : { $text: { $search: t, $language: 'portuguese' } };
        }
        onFiltro(consulta);
    };

    const buscarIA = async () => {
        const t = termo.trim();
        if (!t) {
            toast.info('Digite algo para buscar com IA');
            return;
        }
        setStatusIA('EPADrão está pensando...');

        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND}/api/epadrao/enviarmensagem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: t }] })
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            let buffer = '';
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
            }

            console.log('[IA RAW buffer]', buffer);

            const lines = buffer.split('\n').filter(Boolean);
            console.log('[IA parsed lines]', lines);

            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    console.log('[IA JSON linha única]', parsed);

                    if (parsed?.tipo === 'busca' && Array.isArray(parsed.dados)) {
                        console.log('[IA resultado válido]', parsed.dados);
                        onResultadoDireto(parsed.dados, true);
                        setStatusIA('');
                        return;
                    }

                    // fallback caso a IA retorne apenas um array
                    if (Array.isArray(parsed)) {
                        console.log('[IA resultado é array direto]', parsed);
                        onResultadoDireto(parsed, true);
                        setStatusIA('');
                        return;
                    }

                    console.warn('[IA conteúdo inesperado]', parsed);
                    toast.error('IA não retornou dados válidos.');

                } catch (erroInterno) {
                    console.error('[Erro ao interpretar linha JSON da IA]', erroInterno, line);
                }
            }

            toast.error('Resposta da IA inválida');

        } catch (err) {
            console.error('[Erro na busca IA]', err);
            toast.error('Erro na busca IA: ' + err.message);
        }

        setStatusIA('');
    };


    const buscar = () => {
        modoIA ? buscarIA() : buscarTexto();
    };

    return (
        <>
            <div className={classes.tabContainer}>
                <div
                    className={`${classes.tab} ${!modoIA ? classes.activeTab : ''}`}
                    onClick={() => setModoIA(false)}
                >
                    Texto
                </div>
                <div
                    className={`${classes.tab} ${modoIA ? classes.activeTab : ''}`}
                    onClick={() => setModoIA(true)}
                >
                    IA
                </div>
                {statusIA && <span className={classes.status}>{statusIA}</span>}
            </div>
            <div className={classes.container}>
                <input
                    className={classes.input}
                    type="text"
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                    placeholder={modoIA ? "Buscar com IA" : "Buscar por texto"}
                    onKeyDown={(e) => e.key === 'Enter' && buscar()}
                />
                <button className={classes.button} onClick={buscar} title={modoIA ? "Buscar com IA" : "Buscar por texto"}>
                    {modoIA ? <SmartToy /> : <Search />}
                </button>
            </div>
        </>
    );
};

export default DirinfraPesquisa;
