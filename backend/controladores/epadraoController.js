// Não precisa importar lerDados, faremos requisição interna
const logger = require("../utils/logs/logger"); // Ajuste o caminho conforme necessário
const { Agent } = require("undici");

const agent = new Agent({
  connect: {
    rejectUnauthorized: false
  }
});

const enviarMensagem = async (req, res) => {
  const { messages } = req.body;
  const ultimaMensagem = messages[messages.length - 1]?.content || "";

  logger.info("=== INICIANDO PROCESSAMENTO DA MENSAGEM ===");
  logger.info(`Mensagem recebida: ${ultimaMensagem}`);

  try {
    // Primeiro, vamos verificar se a mensagem parece ser uma busca de dados
    logger.info("Verificando se é uma busca...");
    const isBusca = await verificarSeBusca(ultimaMensagem);
    logger.info(`É busca? ${isBusca}`);

    if (isBusca) {
      logger.info("Processando como busca de dados...");
      // Se for uma busca, tenta processar com dados
      const resultado = await processarBuscaComDados(ultimaMensagem, req);
      logger.info(`Resultado do processamento: ${JSON.stringify(resultado)}`);

      if (resultado.sucesso) {
        logger.info("Busca bem-sucedida, retornando dados...");
        // Se conseguiu processar a busca, retorna os dados
        return res.status(200).json({
          tipo: 'busca',
          dados: resultado.dados,
          colecao: resultado.colecao,
          filtro: resultado.filtro,
          // explicacao: resultado.explicacao
        });
      } else {
        logger.info("Busca falhou, continuando com chat normal...");
      }
    }

    logger.info("Continuando com chat normal...");
    // Se não for busca ou não conseguiu processar, continua com chat normal
    const upstream = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gemma:2b', messages, stream: true })
    });

    logger.info(`Resposta do Ollama recebida, status: ${upstream.status}`);

    if (!upstream.ok || !upstream.body) {
      logger.info("Erro na resposta do Ollama");
      return res.status(500).json({ error: 'Erro ao obter stream do Ollama' });
    }

    logger.info("Iniciando stream...");
    // Define que vamos enviar texto contínuo (NDJSON)
    res.setHeader('Content-Type', 'application/x-ndjson');

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      res.write(chunk);
    }

    logger.info("Stream finalizado");
    res.end();
  } catch (err) {
    logger.error(`Erro ao processar mensagem: ${err}`);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
};

const verificarSeBusca = async (mensagem) => {
  logger.info("Verificando palavras-chave de busca...");
  // Palavras-chave que indicam busca
  const palavrasBusca = [
    'buscar', 'encontrar', 'procurar', 'listar', 'mostrar', 'exibir',
    'quantos', 'quais', 'onde', 'quando', 'como', 'filtrar', 'consultar'
  ];

  const mensagemLower = mensagem.toLowerCase();
  logger.info(`Mensagem em lowercase: ${mensagemLower}`);

  const encontrou = palavrasBusca.some(palavra => mensagemLower.includes(palavra));
  logger.info(`Palavras encontradas: ${palavrasBusca.filter(palavra => mensagemLower.includes(palavra)).join(', ')}`);

  return encontrou;
};


const processarBuscaComDados = async (mensagem, req) => {
  try {
    const promptInterpretacao = `
Você é um assistente que interpreta perguntas sobre documentos da coleção MongoDB "gerais".

Apenas responda com um JSON, **sem explicações nem comentários**.
Campos disponíveis:
- id_gerais (string)
- titulo_doc (string)
- data_doc (data)
- disciplinas (lista de strings)
- autores (lista com campo SARAM)
- om_autora (string)
- palavras_chave (lista de strings)
- doc_sigadaer (string)
Exemplo de saída válida:
{
  "colecao": "gerais",
  "filtro": { "id_gerais": "22/CDCAER/2025" }
}

Agora, analise esta pergunta:

"${mensagem}"
`.trim();

    const interpretacao = await chamarLLMParaInterpretacao(promptInterpretacao);

    if (interpretacao?.colecao !== 'gerais') {
      return { sucesso: false };
    }

    const baseUrl = process.env.URL;
    const filtroQuery = JSON.stringify(interpretacao.filtro);
    const url = `${baseUrl}/api/crud/ler?colecao=gerais&filtro=${encodeURIComponent(filtroQuery)}`;

    logger.info(`Buscando dados com URL: ${url}`);
    logger.info(`Headers enviados: ${JSON.stringify(req.headers)}`);

    logger.info(`Authorization: ${req.headers.authorization}`);
    logger.info(`Cookie: ${req.headers.cookie}`);

    const crudResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': req.headers.authorization,
        'Cookie': req.headers.cookie,              // <- ESSENCIAL se autenticação é por sessão
        'Content-Type': 'application/json',
      },
      dispatcher: agent
    });

    logger.info(`Resposta do CRUD - status: ${crudResponse.status}`);

    const rawText = await crudResponse.text();  // <- Lê o conteúdo como texto cru
    logger.info(`Conteúdo bruto da resposta: ${rawText}`);

    try {
      const resultado = JSON.parse(rawText);
      return {
        sucesso: true,
        dados: resultado,
        colecao: 'gerais',
        filtro: interpretacao.filtro
      };
    } catch (error) {
      logger.error(`Erro ao fazer parse da resposta JSON: ${error.message}`);
      return { sucesso: false };
    }

  } catch (error) {
    logger.error(`Erro ao processar busca: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    logger.error(`Erro completo:`, JSON.stringify(error));


    return { sucesso: false };
  }
};


const chamarLLMParaInterpretacao = async (prompt) => {
  try {
    logger.info("Chamando LLM para interpretação...");
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma:2b',
        messages: [{ role: 'user', content: prompt }],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição LLM: ${response.status}`);
    }

    const data = await response.json();
    logger.info("Resposta da LLM:", data);
//
    const conteudo = data.message?.content || '';
    logger.info(`Conteúdo da resposta: ${conteudo}`);

    const parsedJson = extrairJsonValido(conteudo);
    if (parsedJson) {
      logger.info(`JSON interpretado com sucesso: ${JSON.stringify(parsedJson)}`);
      return parsedJson;
    } else {
      logger.info("Nenhum JSON válido encontrado na resposta");
      return { colecao: null, filtro: {}, explicacao: "Erro ao interpretar resposta" };
    }
  } catch (error) {
    logger.error(`Erro ao chamar LLM: ${error}`);
    return { colecao: null, filtro: {}, explicacao: "Erro ao processar interpretação" };
  }
};

const extrairJsonValido = (texto) => {
  // Remove blocos markdown tipo ```json ... ```
  const limpo = texto.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, '$1').trim();

  // Tenta parsear diretamente
  try {
    const direto = JSON.parse(limpo);
    if (typeof direto === 'object' && direto !== null) return direto;
  } catch (err) {
    // ignora, tenta via regex
  }

  // Busca por qualquer bloco { ... } no texto
  const matches = [...limpo.matchAll(/\{[\s\S]*?\}/g)];

  for (const match of matches.reverse()) {
    try {
      const json = JSON.parse(match[0]);
      if (typeof json === 'object' && json !== null) return json;
    } catch (e) {
      continue;
    }
  }

  return null;
}


module.exports = { enviarMensagem };