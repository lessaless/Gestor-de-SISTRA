const CodigoProjeto = require("../../modelos/codigoProjetoModel"); // Adjust path as needed

/**
 * Gera o código do projeto BIM no formato: {estado}{localidade}-{benfeitoria}{fase}{sequencia}
 * Exemplo: SPRJ-SUBEP01
 * 
 * @param {Object} params - Parâmetros para geração do código
 * @param {string} params.estado_demanda - Estado da demanda (ex: "SP")
 * @param {string} params.localidade_demanda - Localidade da demanda (ex: "RJ")
 * @param {string} params.benfeitoria - Benfeitoria BIM (ex: "SUB")
 * @param {string} params.id_demanda - ID da demanda associada
 * @param {string} params.fase_do_projeto - Fase do projeto (ex: "EP", "PE", "DC", "AB") - DEFAULT: "EP"
 * @returns {Promise<Object>} Objeto contendo codigo_projeto_bim e sequencia_numerica
 */
const gerarCodigoProjetoBim = async ({ 
	estado_demanda, 
	localidade_demanda, 
	benfeitoria, 
	id_demanda,
	fase_do_projeto  // ✅ Novo parâmetro com default
}) => {
	try {
		console.log("!GERAR CODIGO PROJETO: VALOR DE !fase_do_projeto", !fase_do_projeto)
		// Validações básicas
		if (!estado_demanda || !localidade_demanda || !benfeitoria) {
			console.log(" !GERAR CODIGO PORJETO: Entrei no if do try")
			throw new Error("Campos obrigatórios não fornecidos para gerar código projeto BIM");
		}

		if (!fase_do_projeto) {
			console.warn("⚠️ Fase do Projeto não fornecida, usando default 'EP'");
			fase_do_projeto = "EP";
		}

		console.log(`🔧 Gerando código projeto BIM com fase: ${fase_do_projeto}`);

		// Busca o último código gerado com os mesmos parâmetros
		// IMPORTANTE: A sequência é por estado+localidade+benfeitoria+fase
		const ultimoCodigo = await CodigoProjeto.findOne({
			estado_demanda,
			localidade_demanda,
			benfeitoria,
			fase_do_projeto  // ✅ Filtra por fase também
		})
			.sort({ sequencia_numerica: -1 })
			.limit(1);
		
		// Determina a próxima sequência
		let novaSequencia = 1;
		if (ultimoCodigo && ultimoCodigo.sequencia_numerica) {
			novaSequencia = parseInt(ultimoCodigo.sequencia_numerica) + 1;
		}

		// Formata a sequência com 2 dígitos (01, 02, ..., 99)
		const sequenciaFormatada = novaSequencia.toString().padStart(2, '0');
		console.log("Valor de fase_do_projeto antes de gerar codigo_projeto_bim é", fase_do_projeto)

		// Gera o código projeto BIM com a fase selecionada
		const codigo_projeto_bim = `${estado_demanda}${localidade_demanda}-${benfeitoria}${fase_do_projeto}${sequenciaFormatada}`;

		console.log(`✅ Código projeto BIM gerado: ${codigo_projeto_bim} (fase_do_projeto: ${fase_do_projeto}, seq: ${sequenciaFormatada})`);

		return {
			codigo_projeto_bim,
			sequencia_numerica: sequenciaFormatada,
			fase_do_projeto
		};

	} catch (error) {
		console.error("Erro ao gerar código projeto BIM:", error);
		throw new Error("Falha ao gerar código projeto BIM: " + error.message);
	}
};

module.exports = gerarCodigoProjetoBim;