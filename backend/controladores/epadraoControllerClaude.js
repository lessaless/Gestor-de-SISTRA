const { objModelos, colecoesLiberadas } = require("../utils/modelosMongo/modelosMongo");
// Não precisa importar lerDados, faremos requisição interna
const logger = require("../utils/logs/logger"); // Ajuste o caminho conforme necessário

const enviarMensagem = async (req, res) => {
  const { messages } = req.body;
  const ultimaMensagem = messages[messages.length - 1]?.content || "";

  console.log("=== INICIANDO PROCESSAMENTO DA MENSAGEM ===");
  console.log("Mensagem recebida:", ultimaMensagem);

  try {
    // Primeiro, vamos verificar se a mensagem parece ser uma busca de dados
    console.log("Verificando se é uma busca...");
    const isBusca = await verificarSeBusca(ultimaMensagem);
    console.log("É busca?", isBusca);
    
    if (isBusca) {
      console.log("Processando como busca de dados...");
      // Se for uma busca, tenta processar com dados
      const resultado = await processarBuscaComDados(ultimaMensagem, req);
      console.log("Resultado do processamento:", resultado);
      
      if (resultado.sucesso) {
        console.log("Busca bem-sucedida, retornando dados...");
        // Se conseguiu processar a busca, retorna os dados
        return res.status(200).json({
          tipo: 'busca',
          dados: resultado.dados,
          colecao: resultado.colecao,
          filtro: resultado.filtro,
          explicacao: resultado.explicacao
        });
      } else {
        console.log("Busca falhou, continuando com chat normal...");
      }
    }

    console.log("Continuando com chat normal...");
    // Se não for busca ou não conseguiu processar, continua com chat normal
    const upstream = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gemma:2b', messages, stream: true })
    });

    console.log("Resposta do Ollama recebida, status:", upstream.status);

    if (!upstream.ok || !upstream.body) {
      console.log("Erro na resposta do Ollama");
      return res.status(500).json({ error: 'Erro ao obter stream do Ollama' });
    }

    console.log("Iniciando stream...");
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

    console.log("Stream finalizado");
    res.end();
  } catch (err) {
    console.error('Erro ao processar mensagem:', err);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
};

const verificarSeBusca = async (mensagem) => {
  console.log("Verificando palavras-chave de busca...");
  // Palavras-chave que indicam busca
  const palavrasBusca = [
    'buscar', 'encontrar', 'procurar', 'listar', 'mostrar', 'exibir',
    'quantos', 'quais', 'onde', 'quando', 'como', 'filtrar', 'consultar'
  ];
  
  const mensagemLower = mensagem.toLowerCase();
  console.log("Mensagem em lowercase:", mensagemLower);
  
  const encontrou = palavrasBusca.some(palavra => mensagemLower.includes(palavra));
  console.log("Palavras encontradas:", palavrasBusca.filter(palavra => mensagemLower.includes(palavra)));
  
  return encontrou;
};

const processarBuscaComDados = async (mensagem, req) => {
  try {
    // Obter coleções disponíveis para GET
    const colecoesDisponiveis = colecoesLiberadas.GET || [];
    
    // Criar contexto sobre as coleções disponíveis
    const contextoColecoes = colecoesDisponiveis.map(colecao => {
      const modelo = objModelos[colecao];
      if (!modelo) return null;
      
      const campos = Object.keys(modelo.modelo.schema.paths).filter(campo => {
        return !modelo.automaticos.includes(campo);
      });
      
      return {
        nome: colecao,
        campos: campos
      };
    }).filter(item => item !== null);

    // Preparar prompt para a LLM interpretar a busca
    const promptInterpretacao = `
Você é um assistente que ajuda usuários a fazer buscas em um banco de dados MongoDB.

COLEÇÕES DISPONÍVEIS:
${contextoColecoes.map(col => `- ${col.nome}: campos [${col.campos.join(', ')}]`).join('\n')}

PERGUNTA DO USUÁRIO: "${mensagem}"

Analise a pergunta e retorne APENAS um JSON válido com esta estrutura:
{
  "colecao": "nome_da_colecao_identificada",
  "filtro": {},
  "explicacao": "explicacao_breve_do_que_foi_interpretado"
}

Se não conseguir identificar uma coleção específica ou a pergunta não for uma busca válida, retorne:
{
  "colecao": null,
  "filtro": {},
  "explicacao": "Não foi possível identificar uma busca específica"
}

IMPORTANTE: Retorne APENAS o JSON, sem explicações adicionais.
`;

    // Chamar a LLM para interpretar
    const interpretacao = await chamarLLMParaInterpretacao(promptInterpretacao);
    
    if (!interpretacao.colecao) {
      return { sucesso: false };
    }

    // Verificar se a coleção é válida e autorizada
    if (!colecoesDisponiveis.includes(interpretacao.colecao)) {
      return { sucesso: false };
    }

    // Fazer requisição interna para o endpoint CRUD
    const baseUrl = req.protocol + '://' + req.get('host');
    const filtroQuery = JSON.stringify(interpretacao.filtro);
    const url = `${baseUrl}/api/crud?colecao=${interpretacao.colecao}&filtro=${encodeURIComponent(filtroQuery)}`;
    
    const crudResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json'
      }
    });

    if (!crudResponse.ok) {
      throw new Error(`Erro na busca CRUD: ${crudResponse.status}`);
    }

    const resultado = await crudResponse.json();

    return {
      sucesso: true,
      dados: resultado,
      colecao: interpretacao.colecao,
      filtro: interpretacao.filtro,
      explicacao: interpretacao.explicacao
    };

  } catch (error) {
    logger.error(`Erro ao processar busca: ${error.message}`);
    return { sucesso: false };
  }
};

const chamarLLMParaInterpretacao = async (prompt) => {
  try {
    console.log("Chamando LLM para interpretação...");
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
    console.log("Resposta da LLM:", data);
    
    const conteudo = data.message?.content || '';
    console.log("Conteúdo da resposta:", conteudo);
    
    // Tentar extrair JSON da resposta
    const jsonMatch = conteudo.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedJson = JSON.parse(jsonMatch[0]);
      console.log("JSON interpretado:", parsedJson);
      return parsedJson;
    }
    
    console.log("Nenhum JSON encontrado na resposta");
    return { colecao: null, filtro: {}, explicacao: "Erro ao interpretar resposta" };
  } catch (error) {
    console.error('Erro ao chamar LLM:', error);
    return { colecao: null, filtro: {}, explicacao: "Erro ao processar interpretação" };
  }
};

module.exports = { enviarMensagem };