const Gerais = require("../../modelos/geraisModel"); // Adjust path as needed
const PEIs = require("../../modelos/peisModel")
/**
 * Gera o código do documento BIM no formato: {estado}{localidade}-{benfeitoria}{fase}{sequencia}-{disciplina}-{LL}{NNN}
 * Exemplo: SPRJ-SUBEP01-GER-EP001
 * 
 * @param {Object} params - Parâmetros para geração do código
 * @param {string} params.codigo_projeto_bim - Código do projeto BIM já gerado
 * @param {string} params.tipoDocumento - Tipo do documento (ex: "EstudoTecnicoPreliminarDeEngenharia")
 * @param {string} params.LL - Código LL do documento (ex: "EP" para ETPE, "CN" para CN)
 * @param {string} params.disciplina - Disciplina (ex: "GER")
 * @returns {Promise<Object>} Objeto contendo codigo_documento_bim e sequencia_numerica_nnn
 */
const gerarCodigoDocumentoBim = async ({ codigo_projeto_bim, tipoDocumento, LL, disciplina, }) => {
	try {
		// Validações básicas
		if (!codigo_projeto_bim) {
			throw new Error("Código projeto BIM não fornecido");
		}

		if (!tipoDocumento) {
			throw new Error("Tipo de documento é obrigatório");
		}

		if (!LL) {
			throw new Error("Código LL é obrigatório");
		}

		// Busca a última sequência NNN para este tipo de documento usando o modelo Gerais
		// O campo __t é automaticamente criado pelo Mongoose para discriminators
		const ultimoDocumento = await Gerais.findOne({
			__t: tipoDocumento,
			sequencia_numerica_nnn: { $exists: true, $ne: null }
		})
			.sort({ sequencia_numerica_nnn: -1 })
			.limit(1);

		// Determina a próxima sequência NNN
		let novaSequenciaNNN = 1;
		if (ultimoDocumento && ultimoDocumento.sequencia_numerica_nnn) {
			const sequenciaAtual = parseInt(ultimoDocumento.sequencia_numerica_nnn);
			if (!isNaN(sequenciaAtual)) {
				novaSequenciaNNN = sequenciaAtual + 1;
			}
		}

		// Formata a sequência com 3 dígitos (001, 002, ..., 999)
		const sequenciaNNNFormatada = novaSequenciaNNN.toString().padStart(3, '0');

		// Gera o código documento BIM
		const codigo_documento_bim = `${codigo_projeto_bim}-${disciplina}-${LL}${sequenciaNNNFormatada}`;

		console.log(`Código documento BIM gerado: ${codigo_documento_bim} (LL: ${LL}, sequência NNN: ${sequenciaNNNFormatada})`);

		return {
			codigo_documento_bim,
			sequencia_numerica_nnn: sequenciaNNNFormatada
		};

	} catch (error) {
		console.error("Erro ao gerar código documento BIM:", error);
		throw new Error("Falha ao gerar código documento BIM: " + error.message);
	}
};

module.exports = gerarCodigoDocumentoBim;