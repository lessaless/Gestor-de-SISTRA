import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { toast } from 'react-toastify';

import SwapVertIcon from '@mui/icons-material/SwapVert';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

// import DirinfraCardHeader from '../../components/DirinfraCard/DirinfraCardHeader';
import DirinfraCard from '../DirinfraCard/DirinfraCard';
import DirinfraCardBody from '../DirinfraCard/DirinfraCardBody';

import Concordar from '../DirinfraConcordar/DirinfraConcordar';

import adminService from '../../services/adminService';

const useStyles = makeStyles({
    titulo: {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: 'var(--color-font4light)',
        margin: '10px 10px 0 10px',
    },
    container: {
        border: '1px solid var(--color-borderdefault)',
        borderRadius: '4px',
        marginTop: '20px',
        maxHeight: 'calc(74vh - var(--topbar-height))',
        overflowY: 'auto'
    },
    linha: {
        display: 'flex',
        borderBottom: '1px solid var(--color-borderdefault)',
        padding: '10px',
        alignItems: 'center',
    },
    linhaImpar: { backgroundColor: 'var(--color-bg4)' },
    linhaPar: { backgroundColor: 'var(--color-bg2)' },

    cabecalho: {
        alignItems: 'center',
        backgroundColor: 'var(--color-theme1)',
        borderBottom: '1px solid var(--color-borderdefault)',
        color: 'var(--color-font4dark)',
        display: 'flex',
        padding: '14px',
        position: 'sticky',
        top: 0,
        zIndex: 1,
        userSelect: 'none'
    },
    coluna: {
        flex: 1,
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center'
    },
    colunaComClique: {
        cursor: 'pointer',
    },
    colunaCentralizada: {
        width: '64px',
        justifyContent: 'center',
        display: 'flex',
        alignItems: 'center',
    },
    labelEBotao: {
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center',
    },
    botao: {
        border: 'none',
        borderRadius: '4px',
        height: 'max-content',
        marginLeft: '5px',
        padding: '8px',
        width: 'max-content',
    },
    botaoNomear: { backgroundColor: 'var(--botao-novo)' },
    botaoRevogar: { backgroundColor: 'var(--botao-deletar)' },

    iconeOrdem: {
        color: 'var(--color-borderLineFocus100)',
        fontSize: '1rem  !important',
        opacity: '0.4'
    },
    iconeOrdemAtivo: {
        color: 'var(--color-borderLineFocus100)',
        fontSize: '1.2rem  !important'
    },
    inputBusca: {
        color: 'var(--color-font4light)',
        flex: 1,
        padding: '3px',
        backgroundColor: 'var(--color-bg1)',
        border: 'none',
        borderBottom: '1px solid var(--color-borderdefault)',
        outline: 'none',
        transition: '0.5s',
        margin: '10px',

        '&:focus': {
            borderBottom: '1px solid var(--color-borderfocus)'
        }
    },
    popup: {
        padding: '6px',
        paddingBottom: '2px',
        backgroundColor: '#000000c0'
    }
});

const ordemPostos = [
    "s2", "s1", "cb",
    "3s", "2s", "1s", "so", "ap", "2t", "1t",
    "cp", "mj", "tc", "cl", "br", "mb", "tb"
];

const PreCadastroADM = () => {

    const classes = useStyles();
    const [preCadastros, setPrecadastros] = useState([]);
    const [ordenacao, setOrdenacao] = useState({ campo: null, ordem: null });
    const [filtro, setFiltro] = useState('');

    const aprovar = async (pessoa) => {
        const confirmar = await Concordar('', `Deseja confirmar a aprovação do usuário ${pessoa.POSTO} ${pessoa.NOME} (${pessoa.SARAM})?`, 'Cancelar', 'Confirmar');
        if (!confirmar) return;
        try {
            const response = await adminService.aprovarPreCadastro(pessoa);
            if (response.status === 201) {
                toast.success('Pré-cadastro aprovado com sucesso!');
                setPrecadastros(preCadastros.filter(item => item.SARAM !== pessoa.SARAM));
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const remover = async (pessoa) => {
        const confirmar = await Concordar('', `Deseja confirmar a remoção do usuário ${pessoa.POSTO} ${pessoa.NOME} (${pessoa.SARAM})?`, 'Cancelar', 'Confirmar');
        if (!confirmar) return;
        try {
            const response = await adminService.removerPreCadastro(pessoa);
            if (response.status === 200) {
                toast.success('Pré-cadastro removido com sucesso!');
                setPrecadastros(preCadastros.filter(item => item.SARAM !== pessoa.SARAM));
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };


    useEffect(() => {
        async function buscarPrecadastros() {
            try {
                const response = await adminService.verPreCadastros();
                if (response.status === 200) {
                    setPrecadastros(response.data);
                }
            } catch (error) {
                toast.error(error);
            }
        }
        buscarPrecadastros();
    }, []);

    const ordenarDados = (campo) => {
        const primeiroCliqueCampo = ordenacao.campo !== campo;
        let eCrescente = primeiroCliqueCampo ? true : ordenacao.ordem === 'crescente';

        const ordenados = [...preCadastros].sort((a, b) => {
            let valorA = a[campo]?.toString().toLowerCase() || '';
            let valorB = b[campo]?.toString().toLowerCase() || '';

            if (campo === "POSTO") {
                let indexA = ordemPostos.indexOf(valorA);
                let indexB = ordemPostos.indexOf(valorB);

                indexA = indexA === -1 ? ordemPostos.length : indexA; // Se não encontrar, coloca no final
                indexB = indexB === -1 ? ordemPostos.length : indexB;

                return eCrescente ? indexA - indexB : indexB - indexA;
            }

            if (valorA < valorB) return eCrescente ? -1 : 1;
            if (valorA > valorB) return eCrescente ? 1 : -1;
            return 0;
        });

        setPrecadastros(ordenados);
        setOrdenacao({ campo, ordem: eCrescente ? 'decrescente' : 'crescente' });
    };

    const iconeOrdenacao = (campo) => {
        if (ordenacao.campo !== campo) return <SwapVertIcon className={classes.iconeOrdem} />;
        return ordenacao.ordem === 'crescente' ?
            <ArrowDownwardIcon className={classes.iconeOrdemAtivo} /> :
            <ArrowUpwardIcon className={classes.iconeOrdemAtivo} />;
    };

    const preCadastrosFiltrados = preCadastros.filter(pessoa =>
        Object.values(pessoa).some(valor =>
            valor?.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
                .includes(filtro.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())
        )
    );


    return (
        <div>
            <DirinfraCard>
                <DirinfraCardBody>
                    <div>
                        <h2 className={classes.titulo}>Pré-cadastros</h2><br />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            className={classes.inputBusca}
                            placeholder="Filtrar..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                    </div>

                    {preCadastrosFiltrados.length === 0 ? (
                        <span style={{ margin: '20px', display: 'block' }}>
                            Nenhum resultado disponível.
                        </span>
                    ) :
                        (<div className={classes.container}>
                            <div className={classes.cabecalho}>
                                {['SARAM', 'POSTO', 'NOME', 'OM', 'DATA'].map((field, i) => (
                                    <div
                                        key={field}
                                        className={classes.coluna + ' ' + classes.colunaComClique}
                                        onClick={() => ordenarDados(field)}
                                    >
                                        {field}
                                        {iconeOrdenacao(field)}
                                    </div>

                                ))}
                                <div
                                    className={classes.coluna}
                                >
                                    AÇÃO
                                </div>
                            </div>
                            {preCadastrosFiltrados.map((pessoa, index) => (
                                <div key={pessoa.SARAM} className={`${classes.linha} ${index % 2 === 0 ? classes.linhaPar : classes.linhaImpar}`}>
                                    <div className={classes.coluna}>
                                        <a style={{ color: 'var(--color-link)' }}
                                            href={`https://acesso.sigaer.intraer:5432/soap/single/?appid=76187cf6-05ec-480a-b6d9-6b455cdefdae&obj=6bda5b58-7c4d-4560-9536-a49fce80f0fc&theme=breeze&opt=ctxmenu,currsel&select=$::Pessoa%20-%20Numero%20de%20Ordem,${pessoa.SARAM}&select=$::Dimens%C3%A3o,Contato%20-%20Email,Localidade%20-%20Organiza%C3%A7%C3%A3o%20Militar,Pessoa%20-%20CPF,Pessoa%20-%20Especialidade,Pessoa%20-%20Nome%20de%20Guerra,Pessoa%20-%20Posto,Pessoa%20-%20Quadro,Pessoa%20-%20SARAM,Pessoa%20-%20Tipo,Pessoa%20-%20%C3%9Altima%20Promo%C3%A7%C3%A3o`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Link para o SIGAER - Precisa estar previamente logado."
                                        >
                                            {pessoa.SARAM}
                                        </a>
                                    </div>
                                    <div className={classes.coluna}><label className={classes.colunaCentralizada}>{pessoa.POSTO}</label></div>
                                    <div className={classes.coluna}>{pessoa.NOME}</div>
                                    <div className={classes.coluna}>{pessoa.OM}</div>
                                    <div className={classes.coluna}>{new Date(pessoa.DATA).toLocaleDateString('pt-BR')}</div>
                                    <div className={`${classes.coluna} ${classes.labelEBotao}`}>
                                        <button
                                            className={`${classes.botao} ${classes.botaoNomear}`}
                                            onClick={() => aprovar(pessoa)}
                                        >
                                            Aprovar
                                        </button>
                                        <button
                                            className={`${classes.botao} ${classes.botaoRevogar}`}
                                            onClick={() => remover(pessoa)}
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>)
                    }

                </DirinfraCardBody>
            </DirinfraCard>
        </div>
    );
};

export default PreCadastroADM;