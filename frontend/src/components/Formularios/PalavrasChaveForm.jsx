import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { toast } from 'react-toastify';

import DirinfraInput from '../DirinfraInput/DirinfraInput';
import Disciplinas from '../../utils/Disciplinas';

const useStyles = makeStyles(theme => ({
    main: {
        display: 'flex',
        flexDirection: 'column'
    },
    _: {
        width: '35%'
    },
    keywordsContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5px',
        marginBottom: '15px',
        marginTop: '-20px',
        width: '65%'
    },
    keywordBlock: {
        backgroundColor: 'var(--color-bg2)',
        color: 'var(--color-font4Light)',
        padding: '2px 8px',
        borderRadius: '5px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
    },
    removeButton: {
        marginLeft: '8px',
        cursor: 'pointer',
        color: 'var(--color-font4Light)',
        fontWeight: 'bold',
        '&:hover': {
            color: 'var(--botao-deletar)',
        },
    }
}));

/////////////////////////////////////////////////////////////////////////////////////////////////
const PalavrasChaveForm = ({ register, errors, setValue, watch, ...props }) => {

    const classes = useStyles();
    const keywordsDB = watch("palavras_chave");// keywords do banco (ao dar reset() no formulário pai)

    const listaDicas = props.listaDicas || Disciplinas;// sugestões em datalist

    const [keywords, setKeywords] = useState([]); // Armazena as palavras
    const [inputValue, setInputValue] = useState(''); // Valor atual

    const aoDigitar = (event) => {
        if ((event.key === 'Enter') || event.key === ',') {
            event.preventDefault();
            const trimmedValue = inputValue.trim().toLowerCase(); // Remove espaços e transforma em minúsculas
            if (trimmedValue) {
                // Verifica se a palavra-chave já existe (sem considerar maiúsculas e minúsculas)
                if (!keywords.map(keyword => keyword.toLowerCase()).includes(trimmedValue)) {
                    setKeywords([...keywords, trimmedValue]); // Adiciona na lista
                    setValue('palavras_chave', [...keywords, trimmedValue]); // Atualiza o valor do campo
                    setInputValue(''); // Limpa o campo

                } else toast.error("Palavra-chave já inserida!")

            }
        }
    };

    const removerKeyword = (indexToRemove) => {
        setKeywords(keywords.filter((_, index) => index !== indexToRemove));
    };

    useEffect(() => {
        if (keywordsDB) setKeywords(keywordsDB); // Se vier do banco, atualiza o estado
    }, [keywordsDB]);



    return (
        <div className={classes.main}>

            <div className='linha'>
                <em className="obrigatorios">*</em>
                <DirinfraInput
                    name='palavras_chave_FAKE'
                    erros={errors}
                    label='Palavras-chave'
                    placeholder="Mínimo: 3 palavras - Use 'Enter' ou ',' após digitar"
                    registro={register}
                    validar={() => keywords.length >= 3 || "Insira pelo menos 3 palavras-chave."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={aoDigitar}
                    opcoesDataList={listaDicas}
                    inverterValores={true}
                />
            </div>

            <div className="linha">
                <div className={classes._}></div>
                <div className={classes.keywordsContainer}>
                    {keywords.map((keyword, index) => (
                        <span key={index} className={classes.keywordBlock}>
                            {keyword}
                            <span className={classes.removeButton} onClick={() => removerKeyword(index)}>
                                ×
                            </span>
                        </span>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default PalavrasChaveForm;