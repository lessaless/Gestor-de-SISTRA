const ETPE = require("../../modelos/etpeModel");

const gerarIdETPE = async (id_demanda) => {
	const ultimoETPE = await ETPE.findOne({ id_demanda: id_demanda }, {}, { sort: { 'id_etpe': -1 } });
	const ultimoId = ultimoETPE?.id_etpe;


	let novoNumeroSequencial = '1';

	if (ultimoId) {
		// Remova a parte do id_demanda e "CN" para obter apenas o número sequencial
		const ultimoNumeroSequencial = parseInt(ultimoId.replace(/-/g, '').replace(id_demanda.replace(/-/g, ''), '').replace('ETPE', ''));
		novoNumeroSequencial = (ultimoNumeroSequencial + 1).toString();
	}

	return `${id_demanda}-ETPE-${novoNumeroSequencial}`;
}


module.exports = gerarIdETPE;