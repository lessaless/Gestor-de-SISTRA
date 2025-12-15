// const Gerais = require("../../modelos/geraisModel");

// Sequências iniciais para cada OM, para cada Modelo. Usa o que for maior, esse ou o último do banco
const sequenciasIniciais = require("./sequenciasIniciais");

const prefixo = (modelo) => {
	// Extrai apenas as letras maiúsculas do nome do modelo
	// Exemplos de uso
	// prefixo("ParecerTecnico"));         // PT
	// prefixo("LaudoTecnicoAvaliacao")); // LTA
	// prefixo("OrdemTecnica"));          // OT
	return modelo.match(/[A-Z]/g).join('');
};



const gerarIdGerais = async (subModelo, obj) => {
	try {

		const ultimo = await subModelo.aggregate([ // sequência para cada subModelo
			//const ultimo = await Gerais.aggregate([ // sequência unificada Gerais
			{
				$match: { om_autora: obj.om_autora }, // Filtra pela OM
			},
			{
				$addFields: {
					// partes: { $split: ["$id_gerais", "-"] }, // Divide o ID em partes
					partes: { $split: ["$id_gerais", "/"] }, // Divide o ID em partes
				},
			},
			{
				$addFields: {
					// ano: { $toInt: { $arrayElemAt: ["$partes", 3] } }, // Extrai o ano (4ª parte)
					// sequencia: { $toInt: { $arrayElemAt: ["$partes", 1] } }, // Extrai a sequência numérica (2ª parte)
					ano: { $toInt: { $arrayElemAt: ["$partes", 2] } }, // Extrai o ano (3ª parte)
					sequencia: { $toInt: { $arrayElemAt: ["$partes", 0] } }, // Extrai a sequência numérica (1ª parte)
				},
			},
			{
				$sort: {
					ano: -1, // Ordena primeiro pelo ano (descendente)
					sequencia: -1, // Depois pela sequência (descendente)
				},
			},
			{
				$limit: 1, // Retorna apenas o último registro encontrado
			},
		]);

		// Extrai o último ID, se encontrado
		const ultimoId = ultimo.length > 0 ? ultimo[0].id_gerais : null;

		// Define o número sequencial inicial
		let novoNumeroSequencial = 1;

		// Se encontrou o último ID, processa o número
		if (ultimoId) {
			// Remove as partes textuais e extrai o número
			// const match = ultimoId.match(/(\d+)-/);//com prefixo
			const match = ultimoId.match(/^(\d+)\//);//sem prefixo
			if (match && match[1]) {
				novoNumeroSequencial = parseInt(match[1]) + 1;
			}
		}

		// Formata om_autora para maiúsculo e remove caracteres como hífen
		const OM = obj.om_autora.toUpperCase().replace(/[^A-Z0-9]/g, '');


		// --------------------------------------- Nova lógica para implementação de sequência inicial ----------------------------------------------------------------
		const modelo = subModelo.modelName;

		// Busca valor inicial, se existir
		const valorInicial = sequenciasIniciais[OM]?.[modelo];

		if (!ultimoId && valorInicial) {
			novoNumeroSequencial = valorInicial;//se não tem no BD, usa da sequência inicial
		} else if (valorInicial && novoNumeroSequencial <= valorInicial) {
			novoNumeroSequencial = valorInicial;
		}
		// --------------------------------------- fim da Nova lógica para implementação de sequência inicial ---------------------------------------------------------



		// Obtem o ano atual
		const ANO = new Date().getFullYear();

		// Monta o ID final
		// return `${prefixo(subModelo.modelName)}-${novoNumeroSequencial}-${OM}-${ANO}`;
		return `${novoNumeroSequencial}/${OM}/${ANO}`;

	} catch (error) {
		console.error("Erro ao gerar o ID: ", error);
		throw new Error("Falha ao gerar o Identificador");
	}
};

module.exports = gerarIdGerais;