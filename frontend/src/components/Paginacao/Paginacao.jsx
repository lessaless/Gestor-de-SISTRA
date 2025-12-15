import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { makeStyles } from '@material-ui/core/styles';

import DirinfraSelect from '../DirinfraSelect/DirinfraSelect';
import DirinfraMultiCheckbox from '../DirinfraMultiCheckbox/DirinfraMultiCheckbox';

// true = texto, false = símbolos
const LABEL_BOTOES_TEXTO = true;

var botoesPaginacao = LABEL_BOTOES_TEXTO
    ? botoesPaginacao = ['Primeira', 'Anterior', 'Próxima', 'Última']
    : botoesPaginacao = ['<<', '<', '>', '>>'];

const listaOpcoes = [5, 10, 25, 50, 100]; // opções para escolher a quantidade de itens por página

const useStyles = makeStyles(theme => ({

    main: {
        alignItems: 'center',
        border: 'solid 1px var(--color-borderdefault)',
        borderBottom: 'none',
        borderRadius: '4px',
        borderBottomLeftRadius: '0',
        borderBottomRightRadius: '0',
        display: 'flex',
        flexDirection: 'column-reverse',
        /* flexDirection: 'column', */
        flexWrap: 'wrap',
        justifyContent: 'center',
        margin: '20px 0px 0px',
        padding: '2px'
        /* gap: '25px', */
    },

    paginacao: {
        //border: 'solid 1px var(--color-borderdefault)',
        alignItems: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center',
        /* margin: '10px 4px 0px', */
        padding: '4px',

        '& button': {
            backgroundColor: 'var(--color-bg3)',
            borderColor: 'var(--color-borderdefault)',
            color: 'var(--color-font4light)',
            cursor: 'pointer',
            margin: '0',
            padding: '5px 10px',

            '&:disabled': {
                backgroundColor: 'var(--color-disabled)'
            }
        },

        '& label': {
            margin: '10px',
            fontSize: '0.93rem',
            fontWeight: '500'
        },

        '& span': {
            color: 'var(--color-font4light)',
            margin: '0'
        }
    },

    linhaSeletorPagina: {
        gap: '50px',
        justifyContent: 'center',
        /* margin: '0 10px 5px', */
        width: '100%',
    },
    seletorPagina: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '5px',
        /* width: '600px' */
    },

    em: {
        fontSize: 'smaller',
        paddingLeft: '4px',
        /* width: '100%' */
        /* marginTop: '5px' */
    }
}));


const Paginacao = ({ dados, setDadosPaginados, titulo, listaChaves, camposVisiveis, alterarCamposVisiveis, checkBloqueado }) => {

    const classes = useStyles();
    const [itensPorExibicao, setItensPorExibicao] = useState(listaOpcoes[0]);
    const [exibicaoAtual, setExibicaoAtual] = useState(1); // paginação de resultados

    const { register } = useForm();

    useEffect(() => {
        setExibicaoAtual(1);
    }, [itensPorExibicao, dados]);

    // paginação de resultados
    const totalExibicoes = Math.ceil(dados.length / itensPorExibicao);
    const indiceInicial = (exibicaoAtual - 1) * itensPorExibicao;
    const dadosPaginados = dados.slice(indiceInicial, (indiceInicial + itensPorExibicao));

    useEffect(() => {
        setDadosPaginados(dadosPaginados);
    }, [dados, itensPorExibicao, exibicaoAtual]);


    const gerarBotoesPaginacao = () => {
        const botoes = [];
        const maxBotoesVisiveis = 10;
        var botoesIntermediarios = 8; // 1 botão inicial, 1 botão final e 2 reticências
        const mostrarReticencias = totalExibicoes > maxBotoesVisiveis;

        if (mostrarReticencias) {
            let inicioIntervalo, fimIntervalo;

            botoes.push(
                <button key={'inicial'} onClick={() => setExibicaoAtual(1)} disabled={exibicaoAtual === 1}>{1}</button>
            );

            if (exibicaoAtual <= 5) {
                inicioIntervalo = 2;
                fimIntervalo = Math.min(botoesIntermediarios, totalExibicoes);

            } else if (exibicaoAtual >= (totalExibicoes - 4)) {
                inicioIntervalo = Math.max(totalExibicoes - botoesIntermediarios + 1, 2);
                fimIntervalo = totalExibicoes;

            } else {
                inicioIntervalo = Math.max(exibicaoAtual - 4, 1);
                fimIntervalo = Math.min(exibicaoAtual + 2, totalExibicoes);
            }

            if (inicioIntervalo > 2) { // Verifica se é necessário adicionar a reticência no início
                botoes.push(<span className={classes.span} key="start-ellipsis">...</span>);
            }

            for (let i = inicioIntervalo; i <= fimIntervalo; i++) {
                botoes.push(
                    <button key={i} onClick={() => setExibicaoAtual(i)} disabled={exibicaoAtual === i}>{i}</button>
                );

            }

            if (fimIntervalo < totalExibicoes && totalExibicoes > 3) { // Evita duplicação da última página
                botoes.push(<span className={classes.span} key="end-ellipsis">...</span>);
            }

            botoes.push(
                <button key={totalExibicoes} onClick={() => setExibicaoAtual(totalExibicoes)} disabled={exibicaoAtual === totalExibicoes}>{totalExibicoes}</button>
            );

            // Ajuste para garantir exatamente 10 elementos
            while (botoes.length > maxBotoesVisiveis) {
                if (fimIntervalo < totalExibicoes) {
                    botoes.splice(2, 1); // Remove o segundo botão se houver excesso
                } else {
                    botoes.splice(botoes.length - 1, 1); // Remove o último botão se houver excesso
                }
            }

            while (botoes.length < maxBotoesVisiveis) {
                if (inicioIntervalo > 1) {
                    botoes.splice(1, 0, <button key={inicioIntervalo - 1} onClick={() => setExibicaoAtual(inicioIntervalo - 1)}>{inicioIntervalo - 1}</button>);
                    inicioIntervalo--;
                } else if (fimIntervalo < totalExibicoes) {
                    botoes.splice(botoes.length - 1, 0, <button key={fimIntervalo + 1} onClick={() => setExibicaoAtual(fimIntervalo + 1)}>{fimIntervalo + 1}</button>);
                    fimIntervalo++;
                } else {
                    break;
                }
            }

        } else {
            for (let i = 1; i <= totalExibicoes; i++) {
                botoes.push(
                    <button key={i} onClick={() => setExibicaoAtual(i)} disabled={exibicaoAtual === i}>{i}</button>
                );
            }
        }
        return botoes;
    };


    return (
        <div className={classes.main}>

            <div className={classes.paginacao}>
                <label>Páginas</label>
                <button onClick={() => setExibicaoAtual(1)} disabled={exibicaoAtual === 1}>{botoesPaginacao[0]}</button>
                <button onClick={() => setExibicaoAtual(exibicaoAtual - 1)} disabled={exibicaoAtual === 1}>{botoesPaginacao[1]}</button>
                {gerarBotoesPaginacao()}
                <button onClick={() => setExibicaoAtual(exibicaoAtual + 1)} disabled={exibicaoAtual === totalExibicoes}>{botoesPaginacao[2]}</button>
                <button onClick={() => setExibicaoAtual(totalExibicoes)} disabled={exibicaoAtual === totalExibicoes}>{botoesPaginacao[3]}</button>
            </div>

            <div className={`${classes.linhaSeletorPagina} linha`}>
                <DirinfraSelect
                    className={classes.seletorPagina}
                    l={80}
                    label={
                        <label
                            style={{width: 'max-content', fontSize: '.95rem', fontWeight: '450'}}>
                            Itens por Página
                        </label>
                    }
                    options={listaOpcoes.map(opcao => ({ value: opcao, label: opcao }))}
                    onChange={(e) => setItensPorExibicao(+e.target.value)}
                    defaultValue={listaOpcoes[0]}
                    name="pages"
                    registro={register}
                />
                <DirinfraMultiCheckbox
                    titulo={titulo}
                    listaChaves={listaChaves}
                    camposVisiveis={camposVisiveis}
                    alterarCamposVisiveis={alterarCamposVisiveis}
                    checkBloqueado={checkBloqueado}
                />
                <em className={classes.em}>{`Exibindo ${dadosPaginados.length} de um total de ${dados.length} resultado${dados.length == 1 ? '' : 's'}.`}</em>
            </div>


        </div>
    );
};

export default Paginacao;