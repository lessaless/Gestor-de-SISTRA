const CodigoProjeto = require("../../modelos/codigoProjetoModel"); // Adjust path as needed

/**
 * Salva ou atualiza o código do projeto no banco de dados
 * 
 * @param {Object} params - Parâmetros para salvar o código
 * @param {string} params.codigo_projeto_bim - Código do projeto BIM gerado
 * @param {string} params.codigo_documento_bim - Código do documento BIM gerado
 * @param {string} params.estado_demanda - Estado da demanda
 * @param {string} params.localidade_demanda - Localidade da demanda
 * @param {string} params.benfeitoria - Benfeitoria
 * @param {string} params.sequencia_numerica - Sequência numérica (2 dígitos)
 * @param {string} params.sequencia_numerica_nnn - Sequência numérica NNN (3 dígitos)
 * @param {string} params.id_demanda - ID da demanda associada
 * @param {string} params.fase_do_projeto - Fase do projeto (EP, PE, DC, AB)
 * @returns {Promise<Object>} Documento salvo ou atualizado
 */
const salvarCodigoProjeto = async ({
	codigo_projeto_bim,
	codigo_documento_bim,
	estado_demanda,
	localidade_demanda,
	benfeitoria,
	sequencia_numerica,
	sequencia_numerica_nnn,
	id_demanda,
	fase_do_projeto // ✅ Novo campo com default
}) => {
	try {
		// Verifica se já existe um registro com essa combinação
		// IMPORTANTE: Agora inclui fase_do_projeto no filtro
		const existente = await CodigoProjeto.findOne({
			id_demanda,
			estado_demanda,
			localidade_demanda,
			benfeitoria,
			sequencia_numerica,
			fase_do_projeto  // ✅ Inclui fase no filtro
		});

		let resultado;

		if (existente) {
			// Atualiza o registro existente
			resultado = await CodigoProjeto.findByIdAndUpdate(
				existente._id,
				{
					codigo_projeto_bim,
					codigo_documento_bim,
					sequencia_numerica_nnn,
					fase_do_projeto  // ✅ Atualiza fase também
				},
				{ new: true, runValidators: true }
			);
			console.log(`✏️ Código projeto atualizado: ${codigo_projeto_bim}`);
		} else {
			// Cria novo registro
			resultado = await CodigoProjeto.create({
				codigo_projeto_bim,
				codigo_documento_bim,
				estado_demanda,
				localidade_demanda,
				benfeitoria,
				sequencia_numerica,
				sequencia_numerica_nnn,
				id_demanda,
				fase_do_projeto  // ✅ Salva fase
			});
			console.log(`✨ Novo código projeto criado: ${codigo_projeto_bim} (fase: ${fase_do_projeto})`);
		}

		return resultado;

	} catch (error) {
		console.error("Erro ao salvar código projeto:", error);
		throw new Error("Falha ao salvar código projeto: " + error.message);
	}
};

module.exports = salvarCodigoProjeto;