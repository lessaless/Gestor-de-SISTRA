import React, { useState, useEffect, useCallback, useMemo } from "react";
import adminService from "../../services/adminService";

import DirinfraCardHeader from "../../components/DirinfraCard/DirinfraCardHeader";
import DirinfraCard from "../../components/DirinfraCard/DirinfraCard";
import DirinfraCardBody from "../../components/DirinfraCard/DirinfraCardBody";
import Loading from "../../components/Loader/Loading";

import { toast } from "react-toastify";

const descontoVH = "145px";

const estilo = {
    container: {
        display: "flex",
        height: `calc(100vh - ${descontoVH})`,
    },
    painelEsquerdoContainer: { width: "250px" },
    painelEsquerdoTitulo: {
        padding: "10px",
        borderBottom: "1px solid var(--color-borderdefault)",
        position: "sticky",
        top: 0,
        zIndex: 1,
        background: "var(--color-bg1)",
    },
    painelEsquerdo: {
        overflowY: "auto",
        height: `calc(100vh - ${descontoVH} - 40px)`,
        padding: "10px",
    },
    painelDireito: {
        border: "solid 1px var(--color-borderdefault)",
        flex: 1,
        overflowY: "auto",
        padding: "20px",
        fontFamily: "monospace",
        fontSize: "14px",
    },
    painelDireitoBox: {
        boxShadow:
            "var(--color-shadow) 0px 0px 10px 1px inset, var(--color-shadow) -18px 0px 10px 1px inset",
    },
    lista: { listStyleType: "none", padding: 0, margin: 0 },
    itemLista: {
        margin: "2px 0",
        padding: "10px",
        border: "1px solid var(--color-bg3)",
        cursor: "pointer",
        backgroundColor: "var(--color-bg3)",
        textAlign: "left",
        width: "100%",
        outline: "none",
        color: "var(--color-font4light)",
        height: "auto",
        fontSize: "medium",
        borderRadius: "unset",
    },
    itemSelecionado: {
        backgroundColor: "var(--color-realce4light)",
        border: "1px solid var(--color-borderfocus)",
    },
    linhaLog: { marginBottom: "10px" },
    timestamp: { color: "var(--color-font4light)" },
    mensagemLog: {
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
    },
    json: {
        backgroundColor: "var(--json-bg)", // novo fundo diferenciado
        borderRadius: "5px",
        fontSize: "14px",
        margin: "5px 0",
        padding: "10px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontFamily: "monospace",
    },
    key: { color: "var(--json-key)" },
    string: { color: "var(--json-string)" },
    number: { color: "var(--json-number)" },
    boolean: { color: "var(--json-boolean)" },
    null: { color: "var(--json-null)" },
    bracket: { color: "var(--json-bracket)" },
};

// Função para colorir JSON
const colorirJson = (json) => {
    if (json === null) return <span style={estilo.null}>null</span>;

    if (typeof json === "string")
        return <span style={estilo.string}>"{json}"</span>;

    if (typeof json === "number")
        return <span style={estilo.number}>{json}</span>;

    if (typeof json === "boolean")
        return <span style={estilo.boolean}>{String(json)}</span>;

    if (Array.isArray(json)) {
        return (
            <span>
                <span style={estilo.bracket}>[</span>
                <div style={{ paddingLeft: 20 }}>
                    {json.map((v, i) => (
                        <div key={i}>{colorirJson(v)}</div>
                    ))}
                </div>
                <span style={estilo.bracket}>]</span>
            </span>
        );
    }

    if (typeof json === "object") {
        return (
            <span>
                <span style={estilo.bracket}>{"{"}</span>
                <div style={{ paddingLeft: 20 }}>
                    {Object.entries(json).map(([key, value]) => (
                        <div key={key}>
                            <span style={estilo.key}>"{key}"</span>: {colorirJson(value)}
                        </div>
                    ))}
                </div>
                <span style={estilo.bracket}>{"}"}</span>
            </span>
        );
    }
};

// Função para tratar cada linha do log
const parseLogLine = (line) => {
    const [data, hora, level, ...messageParts] = line.split(" ");
    const message = messageParts.join(" ");

    let formattedMessage = message;
    let isJson = false;

    if (message.includes("{") && message.includes("}")) {
        try {
            const jsonStart = message.indexOf("{");
            const jsonEnd = message.lastIndexOf("}") + 1;
            const jsonString = message.substring(jsonStart, jsonEnd);
            const parsedJson = JSON.parse(jsonString);

            formattedMessage = (
                <>
                    {message.substring(0, jsonStart)}
                    <pre style={estilo.json}>{colorirJson(parsedJson)}</pre>
                    {message.substring(jsonEnd)}
                </>
            );
            isJson = true;
        } catch {
            // mantém mensagem original se JSON for inválido
        }
    }

    return { data, hora, level, formattedMessage, isJson };
};

const Logs = () => {
    const [logFiles, setLogFiles] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [logContent, setLogContent] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [linesToShow, setLinesToShow] = useState(500);

    useEffect(() => {
        const carregar = async () => {
            try {
                const resp = await adminService.verLogs();
                setLogFiles(resp.data.logFiles || []);
            } catch (erro) {
                if (erro.response?.status === 403) {
                    toast.error(
                        "Acesso negado. Você não tem permissão para acessar esta página."
                    );
                    window.location.href = "/";
                } else {
                    console.error(erro);
                }
            }
        };
        carregar();
    }, []);

    const aoClicarArquivo = useCallback(async (nomeArquivo) => {
        setSelectedLog(nomeArquivo);
        setLogContent([]);
        setLinesToShow(1000);
        setIsLoading(true);
        try {
            const resp = await adminService.verArquivo(nomeArquivo);
            const content = resp.data;
            setLogContent(content.split("\n").filter((line) => line.trim() !== ""));
        } catch (erro) {
            console.error("Erro ao buscar conteúdo do log:", erro);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const linhasFormatadas = useMemo(() => {
        return [...logContent].reverse().slice(0, linesToShow).map((line, i) => {
            const { data, hora, level, formattedMessage, isJson } =
                parseLogLine(line);
            return (
                <div key={i} style={estilo.linhaLog}>
                    <span style={estilo.timestamp}>
                        [{data} {hora}]
                    </span>
                    <span
                        style={{
                            color:
                                level === "[error]:"
                                    ? "red" // vermelho do tema
                                    : level === "[warn]:"
                                        ? "orange" // laranja do tema
                                        : "var(--color-font4light)",
                        }}
                    >
                        {` ${level}`}
                    </span>
                    <pre style={isJson ? estilo.json : estilo.mensagemLog}>
                        {formattedMessage}
                    </pre>
                </div>
            );
        });
    }, [logContent, linesToShow]);

    return (
        <DirinfraCard>
            <DirinfraCardHeader titulo="Logs do sistema" />
            <DirinfraCardBody>
                <div style={estilo.container}>
                    <div style={estilo.painelEsquerdoContainer}>
                        <div style={estilo.painelEsquerdoTitulo}>
                            <h2>Arquivos de Log</h2>
                        </div>
                        <div style={estilo.painelEsquerdo}>
                            <ul style={estilo.lista}>
                                {[...logFiles].reverse().map((file) => (
                                    <li key={file}>
                                        <button
                                            type="button"
                                            onClick={() => aoClicarArquivo(file)}
                                            style={{
                                                ...estilo.itemLista,
                                                ...(selectedLog === file ? estilo.itemSelecionado : {}),
                                            }}
                                        >
                                            {file}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div
                        style={
                            selectedLog
                                ? { ...estilo.painelDireito, ...estilo.painelDireitoBox }
                                : estilo.painelDireito
                        }
                    >
                        {selectedLog ? (
                            isLoading ? (
                                <Loading
                                    mensagem="Carregando..."
                                    personalizarEstilo={{ backgroundColor: "unset" }}
                                />
                            ) : (
                                <>
                                    {linhasFormatadas}
                                    {linesToShow < logContent.length && (
                                        <button
                                            onClick={() => setLinesToShow((prev) => prev + 1000)}
                                        >
                                            Mostrar Mais
                                        </button>
                                    )}
                                </>
                            )
                        ) : (
                            <p>Selecione um arquivo de log para visualizar o conteúdo.</p>
                        )}
                    </div>
                </div>
            </DirinfraCardBody>
        </DirinfraCard>
    );
};

export default Logs;
