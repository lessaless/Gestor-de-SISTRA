// const SistraGerais = require("../../modelos/sistraModel");

// Sequências iniciais para cada OM, para cada Modelo. Usa o que for maior, esse ou o último do banco
// const sequenciasIniciais = require("./sequenciasIniciais");

const prefixo = (modelo) => {
	// Extrai apenas as letras maiúsculas do nome do modelo
	// Exemplos de uso
	// prefixo("ParecerTecnico"));         // PT
	// prefixo("LaudoTecnicoAvaliacao")); // LTA
	// prefixo("OrdemTecnica"));          // OT
	return modelo.match(/[A-Z]/g).join('');
};


// let partes;
const gerarIdSistras = async (subModelo, obj) => {
	try {
		console.log("subModelo:", subModelo);
		console.log("subModelo.modelName:", subModelo?.modelName);
		console.log("Is Model?", typeof subModelo?.aggregate === 'function');

		const pipeline = [
			{
				$match: {
					om_autora: obj.om_autora,
					__t: subModelo.modelName
				}
			},
			{
				$addFields: {
					partes: { $split: ["$id_sistra", "/"] }
				}
			},
			{
				$addFields: {
					ano: { $toInt: { $arrayElemAt: ["$partes", 2] } },
					sequencia: { $toInt: { $arrayElemAt: ["$partes", 0] } }
				}
			},
			{
				$sort: {
					ano: -1,
					sequencia: -1
				}
			},
			{
				$limit: 1
			}
		];

		console.log("Pipeline:", JSON.stringify(pipeline, null, 2));

		const ultimo = await subModelo.aggregate(pipeline);

		console.log("Valor de ultimo é", ultimo);

		// Extrai o último ID, se encontrado
		const ultimoId = ultimo.length > 0 ? ultimo[0].id_sistra : null;

		// Define o número sequencial inicial
		let novoNumeroSequencial = 1;

		// Se encontrou o último ID, processa o número
		if (ultimoId) {
			const match = ultimoId.match(/^(\d+)\//);
			if (match && match[1]) {
				novoNumeroSequencial = parseInt(match[1]) + 1;
			}
			console.log("Valor de match é", match);
		}

		// Formata om_autora para maiúsculo e remove caracteres como hífen
		const OM = obj.om_autora.toUpperCase().replace(/[^A-Z0-9]/g, '');
		console.log("Valor de OM é ", OM);

		const modelo = subModelo.modelName;
		console.log("Valor de modelo é", modelo);

		const valorInicial = 1;
		if (!ultimoId && valorInicial) {
			novoNumeroSequencial = valorInicial;
		} else if (valorInicial && novoNumeroSequencial <= valorInicial) {
			novoNumeroSequencial = valorInicial;
		}

		// Obtem o ano atual
		const ANO = new Date().getFullYear();

		// Monta o ID final
		return `${novoNumeroSequencial}/${OM}/${ANO}`;

	} catch (error) {
		console.error("Erro ao gerar o ID: ", error);
		throw new Error("Falha ao gerar o Identificador");
	}
};

module.exports = gerarIdSistras;