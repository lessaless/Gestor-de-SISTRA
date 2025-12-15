import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { toast } from 'react-toastify';

import SwapVertIcon from '@mui/icons-material/SwapVert';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import imgPermissoes from '../../imgs/permissoes.jpg';

// import DirinfraCardHeader from '../../components/DirinfraCard/DirinfraCardHeader';
import DirinfraCard from '../../components/DirinfraCard/DirinfraCard';
import DirinfraCardBody from '../../components/DirinfraCard/DirinfraCardBody';

import Concordar from '../../components/DirinfraConcordar/DirinfraConcordar';

import permissaoService from '../../services/permissaoService';

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
        cursor: 'pointer',
        userSelect: 'none'
    },
    coluna: {
        flex: 1,
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
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
    },
    contResultados: {
        fontSize: 'small',
        textAlign: 'end',

    }
});

const ordemPostos = [
    "s2", "s1", "cb",
    "3s", "2s", "1s", "so", "ap", "2t", "1t",
    "cp", "mj", "tc", "cl", "br", "mb", "tb"
];

const Permissoes = () => {

    const classes = useStyles();
    const [permissoes, setPermissoes] = useState([]);
    const [ordenacao, setOrdenacao] = useState({ campo: null, ordem: null });
    const [filtro, setFiltro] = useState('');

    const [popupAberto, setPopupAberto] = useState(false);
    const abrirPopup = () => setPopupAberto(true);
    const fecharPopup = () => setPopupAberto(false);

    useEffect(() => {
        async function buscarPermissoes() {
            try {
                const response = await permissaoService.buscarPermissoes();
                if (response.status === 200) {
                    setPermissoes(response.data);
                }
            } catch (error) {
                toast.error(error);
            }
        }
        buscarPermissoes();
    }, []);

    const ordenarDados = (campo) => {
        const primeiroCliqueCampo = ordenacao.campo !== campo;
        let eCrescente = primeiroCliqueCampo ? true : ordenacao.ordem === 'crescente';

        const ordenados = [...permissoes].sort((a, b) => {
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

        setPermissoes(ordenados);
        setOrdenacao({ campo, ordem: eCrescente ? 'decrescente' : 'crescente' });
    };

    const iconeOrdenacao = (campo) => {
        if (ordenacao.campo !== campo) return <SwapVertIcon className={classes.iconeOrdem} />;
        return ordenacao.ordem === 'crescente' ?
            <ArrowDownwardIcon className={classes.iconeOrdemAtivo} /> :
            <ArrowUpwardIcon className={classes.iconeOrdemAtivo} />;
    };

    const permissoesFiltradas = permissoes.filter(pessoa =>
        Object.values(pessoa).some(valor =>
            valor?.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
                .includes(filtro.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())
        )
    );

    const alterarAcesso = async (pessoa, acao) => {
        const confirmar = await Concordar('', `Deseja confirmar a ${acao === 'removeradmin' ? 'revogação' : 'nomeação'} para o SARAM ${pessoa.SARAM}?`, 'Cancelar', 'Confirmar');
        if (!confirmar) return;

        try {
            const data = { pessoa, acao };
            const response = await permissaoService.alterarPermissao(data);

            if (response.status === 200) {
                toast.success(response.data.message);

                pessoa.ACESSO = acao === 'removeradmin' ? 'usuario_local' : 'admin_local';
                setPermissoes([pessoa,
                    ...permissoes.filter(p => p.SARAM !== pessoa.SARAM) // Filtra para remover a versão antiga do objeto na página
                ]);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.toString());
        }
    }

    const gerarAcesso = (pessoa) => {
        if (pessoa.ACESSO === 'admin_geral') return (<>
            EPAD
        </>);
        if (pessoa.ACESSO === 'admin_local') return (<>
            ADM Local
            <button
                className={`${classes.botao} ${classes.botaoRevogar}`}
                onClick={() => alterarAcesso(pessoa, 'removeradmin')}>Revogar ADM
            </button>
        </>);
        if (pessoa.ACESSO === 'usuario_local') return (<>
            Usuário Local
            <button
                className={`${classes.botao} ${classes.botaoNomear}`}
                onClick={() => alterarAcesso(pessoa, 'setaradmin')}>Nomear ADM
            </button>
        </>);
        return "";
    }

    return (
        <div>
            <DirinfraCard>
                <DirinfraCardBody>
                    <div>
                        <h2 className={classes.titulo}>Permissões</h2><br />
                    </div>

                    {permissoesFiltradas.length > 0 && (
                        <span className={classes.contResultados}>
                            {permissoesFiltradas.length} resultado(s)
                        </span>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="text"
                            className={classes.inputBusca}
                            placeholder="Filtrar..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                        <IconButton onClick={abrirPopup} style={{ marginRight: '10px', color: 'var(--color-font4light)' }} >
                            <HelpOutlineIcon />
                        </IconButton>
                    </div>


                    {permissoesFiltradas.length === 0 ? (
                        <span style={{ margin: '20px', display: 'block' }}>
                            Nenhum resultado disponível.
                        </span>
                    ) :
                        (
                            <div className={classes.container}>

                                <div className={classes.cabecalho}>
                                    {['SARAM', 'POSTO', 'NOME', 'OM', 'ACESSO'].map((field) => (
                                        <div
                                            key={field}
                                            className={classes.coluna}
                                            onClick={() => ordenarDados(field)}
                                        >
                                            {field}
                                            {iconeOrdenacao(field)}
                                        </div>
                                    ))}
                                </div>
                                {permissoesFiltradas.map((pessoa, index) => (
                                    <div key={pessoa.SARAM} className={`${classes.linha} ${index % 2 === 0 ? classes.linhaPar : classes.linhaImpar}`}>
                                        <div className={classes.coluna}>{pessoa.SARAM}</div>
                                        <div className={classes.coluna}><label className={classes.colunaCentralizada}>{pessoa.POSTO}</label></div>
                                        <div className={classes.coluna}>{pessoa.NOME}</div>
                                        <div className={classes.coluna}>{pessoa.OM}</div>
                                        <div className={`${classes.coluna} ${classes.labelEBotao}`}>
                                            {gerarAcesso(pessoa)}
                                        </div>
                                    </div>
                                ))}

                            </div>
                        )
                    }

                    < Dialog open={popupAberto} onClose={fecharPopup} maxWidth="md">
                        <DialogContent className={classes.popup}>
                            <img
                                src={imgPermissoes}
                                alt="Ajuda"
                                style={{ maxWidth: '100%', height: 'auto' }}
                            />
                        </DialogContent>
                    </Dialog>


                </DirinfraCardBody>
            </DirinfraCard>
        </div >
    );
};

export default Permissoes;