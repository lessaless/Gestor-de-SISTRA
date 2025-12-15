import React, { useEffect, useState } from "react";
import asciiArt from "./emObras.js"; // conteúdo como string

const AppInaugural = () => {
  const [countdown, setCountdown] = useState("");

  // Pega a data do .env
  const dataLiberacaoStr = process.env.REACT_APP_DATA_LIBERACAO;
  const [dia, mes, ano] = dataLiberacaoStr.split('/');
  const targetDate = new Date(`${ano}-${mes}-${dia}T00:00:00-03:00`);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setCountdown("Já está no ar!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(
        `Liberação em: ${dataLiberacaoStr} — Tempo restante: ${days} dias, ${hours}h ${minutes}min ${seconds}s`
      );
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(interval);
  }, [dataLiberacaoStr]);

  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>{process.env.REACT_APP_TITULO}</h1>
      <h1 style={styles.h1}>🚧 EM BREVE 🚧</h1>
      <pre style={styles.pre}>{asciiArt}</pre>
      <div style={styles.countdown}>{countdown}</div>
      <h2 style={styles.h2}>Seção de Análise de Dados da DIRINFRA</h2>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "monospace",
    backgroundColor: "#181818",
    color: "#0f0",
    textAlign: "center",
    padding: "50px",
    minHeight: "100vh",
  },
  h1: {
    color: "#0f0",
    fontSize: "2.5em",
    textTransform: "uppercase",
  },
  h2: {
    color: "lime",
    marginTop: "0.5em",
  },
  pre: {
    fontFamily: "monospace",
    fontSize: "0.2rem",
    fontWeight: "bold",
    color: "#0f0",
    whiteSpace: "pre",
    margin: "40px auto",
    overflowX: "auto",
  },
  countdown: {
    fontSize: "1.3em",
    marginTop: "30px",
    color: "#0f0",
  },
};

export default AppInaugural;