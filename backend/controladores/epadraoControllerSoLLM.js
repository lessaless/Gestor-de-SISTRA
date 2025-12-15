const enviarMensagem = async (req, res) => {
  const { messages } = req.body;

  try {
    const upstream = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // body: JSON.stringify({ model: 'llama3', messages, stream: true })
      body: JSON.stringify({ model: 'gemma:2b', messages, stream: true })
    });

    if (!upstream.ok || !upstream.body) {
      return res.status(500).json({ error: 'Erro ao obter stream do Ollama' });
    }

    // Define que vamos enviar texto contínuo (NDJSON)
    res.setHeader('Content-Type', 'application/x-ndjson');

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      res.write(chunk); // envia pedaço pro frontend
    }

    res.end(); // Finaliza a resposta
  } catch (err) {
    console.error('Erro ao chamar Ollama:', err);
    res.status(500).json({ error: 'Erro ao comunicar com Ollama' });
  }
};

module.exports = { enviarMensagem };
