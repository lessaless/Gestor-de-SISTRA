import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";

import DirinfraCard from "../DirinfraCard/DirinfraCard";
import DirinfraCardBody from "../DirinfraCard/DirinfraCardBody";

import authReport from "../../services/authReport";

import { templateMail } from "../../utils/templates/mail-template";
import { templateWpp } from "../../utils/templates/wpp-template";
import Loading from "../Loader/Loading";

const useStyles = makeStyles({
    titulo: {
        fontSize: "1.5rem",
        fontWeight: 600,
        color: 'var(--color-font4light)',
        margin: "10px",
    },
    container: {
        // borderTop: "1px solid var(--color-borderdefault)",
        // marginTop: "20px",
        borderRadius: "4px",
        height: "calc(100vh - 200px)",
        overflowY: "auto",
        padding: "10px",
    },
    linha: {
        // borderBottom: "1px solid var(--color-borderdefault)",
        borderRadius: "4px",
        boxShadow: "var(--color-shadow) 0px 0px 10px 2px",
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        justifyContent: "space-between",
        marginBottom: "20px",
        padding: "20px",
        backgroundColor: "var(--color-bg3)",
    },
    coluna: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        flex: 1,
    },
    botao: {
        marginTop: "8px",
        padding: "6px 12px",
        borderRadius: "6px"
    },
    input: {
        width: "100%",
        padding: "8px",
        backgroundColor: "var(--color-bg1)",
        border: "1px solid var(--color-borderdefault)",
        borderRadius: "6px",
        color: 'var(--color-font4light)',
        marginTop: "6px",
        '&:focus, &:focus-visible': {
            outline: 'none !important',//retira padrão do navegador
            borderColor: 'var(--color-borderfocus)',
        },
        '&::placeholder': {
            fontStyle: 'italic',
            color: 'var(--color-placeholder)',
            textAlign: 'left',
            whiteSpace: 'normal',
            flexWrap: 'wrap',
            wordBreak: 'break-word', // Quebra de palavras longas
        },
    },
    spanMensagem: {
        whiteSpace: "pre-line",
        wordBreak: "break-word",
        color: "var(--color-font4light)",
        fontStyle: "italic",
        userSelect: "text",
    },
    filtroContainer: {
        display: "flex",
        alignItems: "center",
        marginBottom: "15px",
        gap: "10px",
    },
    select: {
        backgroundColor: 'var(--color-bg1)',
        color: 'var(--color-font4light)',
        padding: "6px 12px",
        borderRadius: "6px",
        border: "1px solid var(--color-borderdefault)",
        fontSize: "14px",
        cursor: "pointer",
        '&:focus': {
            outline: 'none',
            borderColor: 'none',
        },
    },
    p: {
        margin: "0 0 4px",
    }
});

const ReportsCard = () => {
    const classes = useStyles();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarResolvidos, setMostrarResolvidos] = useState(false);

    useEffect(() => {
        const carregarReports = async () => {
            setLoading(true);
            try {
                const resp = await authReport.lerReports();
                setReports(resp.data || []);

            } catch (error) {
                toast.error(error.response?.data?.message || error.message || "Erro desconhecido");
                console.log(error);
                if ((error.status || error.response.status) === 403) {
                    setTimeout(() => {
                        window.location.href = '/'; // Redireciona para a página inicial
                    }, 2000);
                }

            } finally {
                setLoading(false);

            }
        };
        carregarReports();
    }, []);

    const marcarResolvido = async (id) => {
        try {
            await authReport.atualizarReport(id, { resolvido: true });
            toast.success("Chamado marcado como resolvido!");
            setReports(prev =>
                prev.map(r => (r._id === id ? { ...r, resolvido: true } : r))
            );
        } catch (error) {
            toast.error("Erro ao atualizar o chamado: ", error.response?.data?.message || error.message || "Erro desconhecido");
        }
    };

    const responderEmail = async (report, textareaId) => {
        const textarea = document.getElementById(textareaId);
        const respostaEmail = textarea?.value || "";
        const assunto = `Resposta ao seu chamado: [${report.origem}] ${report.CATEGORIA}`;
        const mensagem = templateMail(report, respostaEmail);

        try {
            const email = await authReport.enviarEmail({
                destinatario: report.detalhesContato,
                assunto,
                mensagem,
            });
            if (email.status === 200) {
                toast.success(email.data.message);
                textarea.value = "";
            }
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    };

    const enviarLinkWhatsApp = async (report, inputId) => {
        const input = document.getElementById(inputId);
        const emailParaEnvio = input?.value || "";
        const link = templateWpp(report);
        const assunto = `Link de contato via WhatsApp – Chamado ${report._id}`;
        const mensagem = `Link para contato via WhatsApp: 👉 <a href="${link}">LINK</a>`.trim();

        try {
            const email = await authReport.enviarEmail({
                destinatario: emailParaEnvio,
                assunto,
                mensagem,
            });
            if (email.status === 200) {
                toast.success(email.data.message);
                input.value = "";
            }
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    };

    const reportsFiltrados = reports.filter(r => mostrarResolvidos ? r.resolvido : !r.resolvido);

    if (loading) return <Loading
        personalizarEstilo={{ backgroundColor: 'unset' }}
        mensagem="Carregando chamados..."
    />


    return (
        <DirinfraCard>
            <DirinfraCardBody>
                <h2 className={classes.titulo}>Chamados</h2>
                <div className={classes.filtroContainer}>
                    <label>Filtrar:</label>
                    <select
                        className={classes.select}
                        value={mostrarResolvidos ? "resolvidos" : "pendentes"}
                        onChange={(e) => setMostrarResolvidos(e.target.value === "resolvidos")}
                    >
                        <option value="pendentes">Pendentes</option>
                        <option value="resolvidos">Resolvidos</option>
                    </select>
                    <span>Exibindo {reportsFiltrados.length} chamado(s)</span>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-borderdefault)', margin: '0px -10px' }} />

                {reportsFiltrados.length === 0 ? (
                            <p style={{ textAlign: "center", padding: "20px" }}>Nenhum chamado encontrado!</p>
                ) : (
                    <div className={classes.container}>
                        {reportsFiltrados.map((report) => (
                            <div key={report._id} className={classes.linha}>
                                {/* Coluna de informações */}
                                <div className={classes.coluna}>
                                    <p className={classes.p}>
                                        <strong>Autor:</strong> {report.SARAM || "Desconhecido"}
                                    </p>
                                    <p className={classes.p}>
                                        <strong>Tipo de contato:</strong> {report.preferenciaContato}
                                    </p>
                                    <p className={classes.p}>
                                        <strong>Contato:</strong> {report.detalhesContato}
                                    </p>
                                    <p className={classes.p}>
                                        <strong>Mensagem:</strong>{" "}<span className={classes.spanMensagem}>{report.DESCRICAO}</span>
                                    </p>
                                    <p className={classes.p}>
                                        <strong>Data:</strong> {new Date(report.createdAt).toLocaleString()}
                                    </p>
                                    <p className={classes.p}>
                                        <strong>Origem:</strong> {report.origem}
                                    </p>
                                    <p className={classes.p}>
                                        <strong>Status:</strong>{report.resolvido ? (
                                            <span style={{ color: "green" }}>✅ Resolvido</span>
                                        ) : (
                                            <span style={{ color: "orange" }}>⏳ Pendente</span>
                                        )}
                                    </p>
                                    {!report.resolvido && (
                                        <button
                                            className={classes.botao}
                                            onClick={() => marcarResolvido(report._id)}
                                        >
                                            Marcar como resolvido
                                        </button>
                                    )}
                                </div>

                                {/* Coluna de ações */}
                                {!mostrarResolvidos && (
                                    <div className={classes.coluna} style={{ maxWidth: "40%" }}>
                                        {report.preferenciaContato === "email" && (
                                            <>
                                                <label>Responder por email:</label>
                                                <textarea
                                                    id={`resposta-${report._id}`}
                                                    rows="4"
                                                    className={classes.input}
                                                    placeholder="Digite sua resposta..."
                                                />
                                                <button
                                                    className={classes.botao}
                                                    onClick={() => responderEmail(report, `resposta-${report._id}`)}
                                                >
                                                    Enviar resposta por email
                                                </button>
                                            </>
                                        )}

                                        {report.preferenciaContato === "whatsapp" && (
                                            <>
                                                <label>Enviar link do WhatsApp por email:</label>
                                                <input
                                                    id={`email-destino-${report._id}`}
                                                    type="email"
                                                    className={classes.input}
                                                    placeholder="Digite o email de destino"
                                                />
                                                <button
                                                    className={classes.botao}
                                                    onClick={() => enviarLinkWhatsApp(report, `email-destino-${report._id}`)}
                                                >
                                                    Enviar link via email
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <hr style={{ border: 'none', borderTop: '1px solid var(--color-borderdefault)', margin: '0px -10px' }} />

            </DirinfraCardBody>
        </DirinfraCard>
    );
};

export default ReportsCard;
