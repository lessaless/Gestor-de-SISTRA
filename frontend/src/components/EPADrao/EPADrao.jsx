import { useState } from 'react';

function EPADrao() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;

    const newMsg = { role: 'user', content: input };
    const all = [...messages, newMsg];

    // Adiciona a resposta vazia do bot logo em seguida
    const placeholder = { role: 'assistant', content: '' };
    setMessages([...all, placeholder]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND}/api/epadrao/enviarmensagem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: all })
      });

      if (!res.ok) {
        throw new Error(`Erro HTTP ${res.status} - ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        // Divide por linha NDJSON (1 JSON por linha)
        const lines = chunk.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              fullText += json.message.content;

              setMessages(prev => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = { role: 'EPADrão', content: fullText };
                return msgs;
              });
            }
          } catch (err) {
            console.warn('Erro ao parsear linha do chunk:', line);
          }
        }
      }
    } catch (e) {
      console.error('Erro ao enviar mensagem:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: 600, margin: 'auto', padding: 20 }}>
      <div style={{ height: 400, overflowY: 'scroll', border: '1px solid #ccc', padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '10px 0' }}>
            <b>{m.role === 'user' ? 'Você' : m.role}:</b> {m.content}
          </div>
        ))}
        {loading && <div><i>EPADrão está digitando...</i></div>}
      </div>
      <input
        style={{ width: '100%', padding: 8 }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && send()}
        placeholder="Digite sua pergunta..."
      />
      <button onClick={send} disabled={loading}>Enviar</button>
    </div>
  );
}

export default EPADrao;
