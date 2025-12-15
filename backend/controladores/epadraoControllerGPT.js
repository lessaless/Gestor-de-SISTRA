const asyncHandler = require("express-async-handler");
const { objModelos, colecoesLiberadas } = require("../utils/modelosMongo/modelosMongo");

const enviarMensagem = asyncHandler(async (req, res) => {
  console.log('📥 Requisição recebida em /enviarmensagem');
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0 || !messages[0].content) {
    console.warn('⚠️ Mensagens inválidas ou vazias:', messages);
    return res.status(400).json({ erro: 'Mensagens inválidas ou vazias' });
  }

  const pergunta = messages[messages.length - 1].content;
  console.log('📝 Última pergunta recebida:', pergunta);

  if (typeof pergunta !== 'string' || pergunta.trim() === '') {
    console.warn('⚠️ Pergunta inválida:', pergunta);
    return res.status(400).json({ erro: 'Pergunta inválida' });
  }

  // 1. Mapeia os modelos válidos e seus campos disponíveis
  const modelosDisponiveis = Object.entries(objModelos)
    .filter(([_, { modelo }]) => modelo?.schema?.paths)
    .map(([nome, { modelo, automaticos }]) => {
      const campos = Object.keys(modelo.schema.paths).filter(
        key => !automaticos.includes(key)
      );
      return { nome, campos };
    });

  console.log('📊 Modelos disponíveis para o prompt:', modelosDisponiveis.map(m => m.nome));

  // 2. Cria o prompt de sistema para a LLM
  const systemPrompt = `
Você é um assistente de dados. Sua tarefa é transformar perguntas de linguagem natural em filtros para um banco MongoDB.
Responda com um JSON no seguinte formato, e apenas isso:

{
  "colecao": "nome_da_colecao",
  "filtros": {
    "campo1": "valor exato",
    "campo2": /expressao regular/i
  }
}

Apenas use campos das coleções abaixo:

${JSON.stringify(modelosDisponiveis, null, 2)}

IMPORTANTE: NÃO inclua comentários, explicações ou qualquer texto fora do JSON. Retorne apenas o JSON limpo.
  `;

  try {
    // 3. Envia a pergunta para a IA
    console.log('📡 Enviando pergunta para a IA...');
    const upstream = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma:2b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: pergunta }
        ]
      })
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      console.error(`❌ Erro na resposta da IA (status ${upstream.status}):`, text);
      return res.status(502).json({ erro: 'Erro na comunicação com a IA', detalhe: text });
    }

    const resposta = await upstream.json();
    const conteudo = resposta.message?.content;

    console.log('\n🔎 RESPOSTA BRUTA DA IA:\n', conteudo, '\n');

    // 4. Extração segura do JSON
    let instrucao;
    try {
      const match = conteudo.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Nenhum JSON detectado');
      instrucao = JSON.parse(match[0]);
      console.log('✅ JSON extraído da resposta:', instrucao);
    } catch (e) {
      console.error('❌ Erro ao interpretar resposta da IA:', e.message);
      return res.status(400).json({
        erro: "Resposta da IA não interpretável como JSON.",
        bruta: conteudo
      });
    }

    const { colecao, filtros } = instrucao;
    const entrada = objModelos[colecao];

    if (!colecao || !entrada || !entrada.modelo) {
      console.warn(`⚠️ Coleção inválida ou não autorizada: ${colecao}`);
      return res.status(400).json({ erro: `Coleção inválida ou não autorizada: ${colecao}` });
    }

    console.log(`📁 Consultando a coleção "${colecao}" com filtros:`, filtros);

    const Modelo = entrada.modelo;
    const camposValidos = Object.keys(Modelo.schema.paths);

    const filtrosSanitizados = Object.fromEntries(
      Object.entries(filtros || {}).filter(([k]) => camposValidos.includes(k))
    );

    console.log('🧼 Filtros sanitizados:', filtrosSanitizados);

    const resultados = await Modelo.find(filtrosSanitizados);
    console.log(`📦 ${resultados.length} resultados encontrados.`);

    return res.status(200).json({
      colecao,
      filtros: filtrosSanitizados,
      resultados,
      raw: conteudo
    });

  } catch (err) {
    console.error('🔥 Erro geral ao buscar por IA:', err);
    return res.status(500).json({ erro: 'Erro ao consultar IA ou banco de dados' });
  }
});

module.exports = { enviarMensagem };
