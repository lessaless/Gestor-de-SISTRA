import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Collapse } from '@mui/material';
import { Search, Tune, SearchOff } from '@mui/icons-material';
import { toast } from 'react-toastify';

import DirinfraSelect from '../DirinfraSelect/DirinfraSelect';
import { formulariosGerais, formulariosSistra } from "../../utils/ColecaoModelo";
import { sistraGerais } from "../../utils/ColecaoModelo";
import TextoEmIcone from '../TextoEmIcone/TextoEmIcone';
import verificarPadraoId from '../../utils/verificarPadraoId';

const useStyles = makeStyles({
    mainContainer: {
        margin: '40px',
        borderRadius: '4px',
        background: 'var(--color-bg1)',
    },
    containerBusca: {
        display: 'flex',
        alignItems: 'self-end',
        gap: '10px',
        padding: '0',
        paddingRight: '0',
        borderRadius: '8px',
        width: '100%',
        margin: '0 auto 10px'
    },
    inputBuscaWrapper: {
        position: 'relative',
        flex: 1,
    },
    inputBusca: {
        width: '100%',
        padding: '3px 0',
        backgroundColor: 'var(--color-bg1)',
        border: 'none',
        borderBottom: '1px solid var(--color-font4light)',
        outline: 'none',
        transition: '0.5s',
        color: 'var(--color-fontdefault)',
        '&:focus': {
            borderBottom: '1px solid var(--color-borderfocus)'
        }
    },
    containerFiltro: {
        display: 'flex',
        flexDirection: 'column',
        margin: '20px 0',
        padding: '10px',
        borderRadius: '4px',
        background: 'var(--color-bg1)',
        border: 'dashed 1px var(--color-borderdefault)',
    },
    selectFiltro: {
        width: '100%',
        marginBottom: '10px',
    },
    icones: {
        color: 'var(--color-font4light)',
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        height: '40px',
    },
    icone: {
        color: 'var(--color-font4light)',
    }
});

// -------------------- Funções auxiliares --------------------
const aleatorio = (array) => array[Math.floor(Math.random() * array.length)];

const extrairDocumentoTipos = (dados) => {
    const tiposSet = new Set();
    dados.forEach(item => {
        if (item.__t) tiposSet.add(item.__t);
        console.log("Valores de tiposSet em DirinfraPesquisa é", tiposSet)
    });
    return [{ value: '*', label: 'Todos' }, ...Array.from(tiposSet)
        .sort((a, b) => a.localeCompare(b))
        .map(t => ({ value: t, label: t }))];
};

// const extrairDisciplinas = (dados) => {
//     const disciplinasSet = new Set();
//     dados.forEach(item => {
//         if (item.disciplinas) {
//             item.disciplinas
//                 .split(',')
//                 .map(d => d.trim())
//                 .forEach(d => disciplinasSet.add(d));
//         }
//     });
//     return [{ value: '*', label: 'Todas' }, ...Array.from(disciplinasSet)
//         .sort((a, b) => a.localeCompare(b))
//         .map(d => ({ value: d, label: d }))];
// };

const extrairOMs = (dados) => {
    const omsSet = new Set(dados.map(item => item.om_autora).filter(Boolean));
    return [{ value: '*', label: 'Todas' }, ...Array.from(omsSet)
        .sort((a, b) => a.localeCompare(b))
        .map(om => ({ value: om, label: om }))];
};

const extrairSerinfras = (dados) => {
    const serinfrasSet = new Set(dados.map(item => item.serinfra).filter(Boolean));
    return [{ value: '*', label: 'Todas' }, ...Array.from(serinfrasSet)
        .sort((a, b) => a.localeCompare(b))
        .map(serinfra => ({ value: serinfra, label: serinfra }))];
};

const extrairAnos = (dados) => {
    const anosSet = new Set(dados.map(item => new Date(item.data_ocorrencia).getFullYear()).filter(Boolean));
    console.log("Valores de anosSet em DirinfraPesquisa é", anosSet)
    return [{ value: '*', label: 'Todos' }, ...Array.from(anosSet)
        .sort((a, b) => a - b) // ordem cronológica crescente
        .map(ano => ({ value: ano, label: ano }))];
};

const conerterParaModelo = (tipo) => {
    const entry = Object.entries(formulariosSistra).find(([key, value]) => value.nome === tipo);
    console.log("Valor de entry em DirinfraPesquisa é", entry)
    return entry ? entry[1].modelo : tipo;
};

// const conerterParaModeloSistra = (tipo) => {
//     const entry = Object.entries(formulariosSistra).find(([key, value]) => value.nome === tipo);
//     return entry ? entry[1].modelo : tipo;
// };

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');

const MAX_CHARS = 100;

const LinhaDeFiltros = memo(({ campos, opcoes, filtros, onFiltroChange }) => {
    return campos.map(({ key, label }) => (
        <DirinfraSelect
            key={key}
            label={label + ':'}
            onChange={(e) => onFiltroChange(key, e.target.value)}
            options={opcoes[key]}
            value={filtros[key]}
        />
    ));
});

// -------------------- Componente principal --------------------
const DirinfraPesquisa = ({ setFiltro, dados }) => {
    const classes = useStyles();
    const [mostrarFiltros, setMostrarFiltros] = useState(false);
    const [regexUsado, setRegexUsado] = useState(false);

    const debouncePesquisaRef = useRef(null);
    const inputRef = useRef(null);
    const dadosOriginaisRef = useRef([]);
    const buscaInicialFeita = useRef(false);

    const [placeholderPhrases, setPlaceholderPhrases] = useState([
        "Digite o termo a ser pesquisado e aperte 'Enter'"
    ]);

    const phraseIndexRef = useRef(0);
    const charIndexRef = useRef(0);
    const deletingRef = useRef(false);
    const typingTimeoutRef = useRef(null);
    const cursorIntervalRef = useRef(null);
    const cursorVisibleRef = useRef(true);

    const [opcoes, setOpcoes] = useState({
        tipoDocumento: [],
        // disciplina: [],
        // serinfra: [],
        // om: [],
        ano: []
    });

    const [filtros, setFiltros] = useState({
        tipoDocumento: '*',
        // serinfra: '*',
        // om: '*',
        ano: '*'
    });

    const campos = [
        { key: 'tipoDocumento', label: 'Tipo de Documento' },
        // { key: 'serinfra', label: 'SERINFRA' },
        // { key: 'om', label: 'OM' },
        // { key: 'serinfra', label: 'SERINFRA' },
        { key: 'ano', label: 'Ano' },
    ];

    const extratores = {
        tipoDocumento: extrairDocumentoTipos,
        // disciplina: extrairDisciplinas,
        // serinfra: extrairSerinfras,
        // om: extrairOMs,
        ano: extrairAnos
    };

    // -------------------- Atualização de filtros --------------------
    const atualizarOpcoes = useCallback(() => {
        console.log("Valor de dados", dados)
        if (!dados?.length) return;

        const novasOpcoes = {};
        campos.forEach(({ key }) => {
            const extrator = extratores[key] || (() => []);
            novasOpcoes[key] = extrator(dados);
        });
        setOpcoes(prev => {
            const novoStr = JSON.stringify(novasOpcoes);
            const antigoStr = JSON.stringify(prev);
            return novoStr !== antigoStr ? novasOpcoes : prev;
        });
        console.log("valor de dados é ", dados)

    }, [dados]);

    const handleFiltroChange = useCallback((campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
    }, []);

    const adicionarFiltros = (consulta) => {
        let { tipoDocumento, ano } = filtros;
        if (tipoDocumento && tipoDocumento !== '*') consulta.__t = conerterParaModelo(tipoDocumento);
        console.log("valor de tipoDocumento é ", tipoDocumento)
        // if (disciplina && disciplina !== '*') consulta.disciplinas = disciplina;
        // if (om && om !== '*') consulta.om_autora = om;
        if (ano && ano !== '*') consulta.data_ocorrencia = { $gte: `${ano}-01-01T00:00:00Z`, $lt: `${ano}-12-31T23:59:59Z` };
        // console.log("Valor de consulta", consulta)
        return consulta;
    };

    const valorAtualInput = () => {
        let termoBusca = inputRef?.current?.value.trim() || '';
        if (termoBusca.length > MAX_CHARS) {
            termoBusca = termoBusca.substring(0, MAX_CHARS);
            toast.info(`O termo de busca foi limitado a ${MAX_CHARS} caracteres. ('${termoBusca}')`);
        }
        return termoBusca;
    };

    const Pesquisar = useCallback(() => {
        if (debouncePesquisaRef.current) clearTimeout(debouncePesquisaRef.current);
        debouncePesquisaRef.current = setTimeout(() => {
            const valorAtual = valorAtualInput().trim();
            buscaInicialFeita.current = false;
            setRegexUsado(false);

            let consulta = {};
            if (valorAtual) {
                if (verificarPadraoId(valorAtual)) {
                    consulta = { id_sistra: valorAtual };
                } else {
                    consulta.$text = { $search: valorAtual, $language: "portuguese" };
                }
            }
            setFiltro(adicionarFiltros(consulta));
        }, 500);
    }, [filtros]);

    const Resetar = () => {
        inputRef.current.value = '';
        setFiltros({ tipoDocumento: '*', ano: '*' });
        if (debouncePesquisaRef.current) clearTimeout(debouncePesquisaRef.current);
        debouncePesquisaRef.current = setTimeout(() => {
            setFiltro({});
        }, 500);
    };

    const aoTeclar = (e) => {
        if (e.key === 'Enter') Pesquisar();
    };

    // -------------------- useEffect principais --------------------
    useEffect(() => {
        if (dados?.length && dadosOriginaisRef.current.length === 0) {
            dadosOriginaisRef.current = [...dados];
            
        }

        if (dados?.length === 0 && !regexUsado && !buscaInicialFeita.current) {
            console.log("Valor de dados?.length ", dados?.length)
            const termoBusca = valorAtualInput() || undefined;
            let consulta = {};
            if (termoBusca) {
                const camposBusca = [
                    "id_sistra",
                    "om_autora", "obs_gerais", "autores.SARAM"
                    // "titulo_doc",
                    // "id_demanda", "palavras_chave",
                    // "disciplinas",
                ];
                consulta.$or = camposBusca.map(campo => ({
                    [campo]: { $regex: escapeRegex(termoBusca), $options: "i" }
                }));
                setRegexUsado(true);
                buscaInicialFeita.current = true;
                setFiltro(adicionarFiltros(consulta));
            }
        }

        if (dados.length > 0 && regexUsado) {
            setRegexUsado(false);
        }

        atualizarOpcoes();
    }, [dados, atualizarOpcoes]);

    useEffect(() => {
        Pesquisar();
    }, [filtros]);

    // -------------------- Placeholder dinâmico --------------------
    useEffect(() => {
        if (dados?.length > 0) {
            const exemplos = [];

            // Palavra-chave aleatória
            const palavrasChaveValidas = dados.filter(d => d.palavras_chave).map(d => d.palavras_chave);
            if (palavrasChaveValidas.length) {
                const exemploString = aleatorio(palavrasChaveValidas);
                const palavras = exemploString.split(',').map(p => p.trim());
                exemplos.push(`Ex: ${aleatorio(palavras)}`);
            }

            // OM aleatória
            const omsValidas = dados.filter(d => d.om_autora).map(d => d.om_autora);
            if (omsValidas.length) exemplos.push(`Ex: ${aleatorio(omsValidas)}`);

            // ID aleatório
            const idsValidos = dados.filter(d => d.id_sistra).map(d => String(d.id_sistra).toUpperCase());
            if (idsValidos.length) exemplos.push(`Ex: ${aleatorio(idsValidos)}`);

            if (exemplos.length > 0) setPlaceholderPhrases(exemplos);
        }
    }, [dados]);

    // -------------------- Efeito de digitação --------------------
    useEffect(() => {
        const typingSpeed = 60;
        const deletingSpeed = 20;
        const pauseAfterComplete = 2000;
        const pauseBetween = 500;

        const updatePlaceholderWithCursor = (text) => {
            const el = inputRef.current;
            if (!el) return;
            const cursor = cursorVisibleRef.current ? '|' : '';
            el.setAttribute('placeholder', text + cursor);
        };

        const step = () => {
            const el = inputRef.current;
            if (!el) {
                typingTimeoutRef.current = setTimeout(step, 500);
                return;
            }

            const focused = document.activeElement === el;
            const hasValue = el.value && el.value.length > 0;
            if (focused || hasValue) {
                if (el.getAttribute('placeholder') !== '') el.setAttribute('placeholder', '');
                typingTimeoutRef.current = setTimeout(step, 300);
                return;
            }

            const currentPhrase = placeholderPhrases[phraseIndexRef.current] || '';
            if (!deletingRef.current) {
                charIndexRef.current++;
                if (charIndexRef.current <= currentPhrase.length) {
                    updatePlaceholderWithCursor(currentPhrase.slice(0, charIndexRef.current));
                    typingTimeoutRef.current = setTimeout(step, typingSpeed);
                } else {
                    deletingRef.current = true;
                    typingTimeoutRef.current = setTimeout(step, pauseAfterComplete);
                }
            } else {
                charIndexRef.current--;
                if (charIndexRef.current >= 0) {
                    updatePlaceholderWithCursor(currentPhrase.slice(0, charIndexRef.current));
                    typingTimeoutRef.current = setTimeout(step, deletingSpeed);
                } else {
                    deletingRef.current = false;
                    phraseIndexRef.current = (phraseIndexRef.current + 1) % placeholderPhrases.length;
                    charIndexRef.current = 0;
                    typingTimeoutRef.current = setTimeout(step, pauseBetween);
                }
            }
        };

        cursorIntervalRef.current = setInterval(() => {
            cursorVisibleRef.current = !cursorVisibleRef.current;
            const el = inputRef.current;
            if (!el) return;
            const focused = document.activeElement === el;
            const hasValue = el.value && el.value.length > 0;
            if (!focused && !hasValue) {
                const ph = el.getAttribute('placeholder') || '';
                const base = ph.replace(/\|+$/, '');
                el.setAttribute('placeholder', base + (cursorVisibleRef.current ? '|' : ''));
            }
        }, 500);

        step();

        return () => {
            clearTimeout(typingTimeoutRef.current);
            clearInterval(cursorIntervalRef.current);
        };
    }, [placeholderPhrases]);

    const handleFocus = () => {
        const el = inputRef.current;
        if (el) el.setAttribute('placeholder', '');
    };

    const handleBlur = () => {
        const el = inputRef.current;
        if (!el) return;
        if (!el.value) {
            const currentPhrase = placeholderPhrases[phraseIndexRef.current] || '';
            const text = currentPhrase.substring(0, charIndexRef.current);
            el.setAttribute('placeholder', text + (cursorVisibleRef.current ? '|' : ''));
        }
    };

    return (
        <div className={classes.mainContainer}>
            <div className={classes.containerBusca}>
                <div className={classes.inputBuscaWrapper}>
                    <input
                        ref={inputRef}
                        type="text"
                        onKeyDown={aoTeclar}
                        className={classes.inputBusca}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    />
                </div>
                <div className={classes.icones}>
                    <TextoEmIcone className={classes.icone} icon={<Search />} label={'Pesquisar'} onClick={Pesquisar} />
                    <TextoEmIcone className={classes.icone} icon={<Tune />} label={'Filtrar'} onClick={() => setMostrarFiltros(!mostrarFiltros)} />
                    <TextoEmIcone className={classes.icone} icon={<SearchOff />} label={'Resetar'} onClick={Resetar} />
                </div>
            </div>

            <Collapse in={mostrarFiltros}>
                <div className={classes.containerFiltro}>
                    {Array.from({ length: Math.ceil(campos.length / 2) }).map((_, linhaIndex) => {
                        const startIndex = linhaIndex * 2;
                        const linhaCampos = campos.slice(startIndex, startIndex + 2);
                        return (
                            <div className="linha" key={linhaIndex}>
                                <LinhaDeFiltros
                                    campos={linhaCampos}
                                    opcoes={opcoes}
                                    filtros={filtros}
                                    onFiltroChange={handleFiltroChange}
                                />
                            </div>
                        );
                    })}
                </div>
            </Collapse>
        </div>
    );
};

export default DirinfraPesquisa;
