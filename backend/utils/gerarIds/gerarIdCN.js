const CN = require("../../modelos/cnModel");

const gerarIdCN = async (id_demanda) => {
	const ultimoCN = await CN.findOne({ id_demanda: id_demanda }, {}, { sort: { 'id_cn': -1 } });
	const ultimoId = ultimoCN?.id_cn;

	let novoNumeroSequencial = '1';

	if (ultimoId) {
		// Remova a parte do id_demanda e "CN" para obter apenas o número sequencial
		const ultimoNumeroSequencial = parseInt(ultimoId.replace(/-/g, '').replace(id_demanda.replace(/-/g, ''), '').replace('CN', ''));
		novoNumeroSequencial = (ultimoNumeroSequencial + 1).toString();
	}

	// Retorna o novo ID no formato "{id da demanda}CN{número sequencial}"
	return `${id_demanda}-CN-${novoNumeroSequencial}`;
}


module.exports = gerarIdCN;