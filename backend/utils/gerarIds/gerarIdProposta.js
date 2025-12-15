const Proposta = require("../../modelos/propostaModel");

const gerarIdProposta = async (id_demanda) => {
	const ultimaProposta = await Proposta.findOne({ id_demanda: id_demanda }, {}, { sort: { 'id_proposta': -1 } });
	const ultimoId = ultimaProposta?.id_proposta;


	let novoNumeroSequencial = '1';

	if (ultimoId) {
		const ultimoNumeroSequencial = parseInt(ultimoId.replace(/-/g, '').replace(id_demanda.replace(/-/g, ''), '').replace('Proposta', ''));
		novoNumeroSequencial = (ultimoNumeroSequencial + 1).toString();
	}

	return `${id_demanda}-Proposta-${novoNumeroSequencial}`;
}


module.exports = gerarIdProposta;