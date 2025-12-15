const Demanda = require("../../modelos/demandaModel");

const gerarIdDemanda = async (ods_objeto) => {
    //ods_demanda
    const ultimaDemanda = await Demanda.findOne({ ods_objeto: ods_objeto }, {}, { sort: { 'id_demanda': -1 } });
    const ultimoId = ultimaDemanda?.id_demanda;

    let novoNumeroSequencial = '1';
    const anoAtual = new Date().getFullYear();

    if (ultimoId) {
        const ultimoNumeroSequencial = parseInt(ultimoId.replace(/-/g, '').replace(/^\d+/, '').replace(ods_objeto, ''));
        novoNumeroSequencial = (ultimoNumeroSequencial + 1).toString();
    }
    
    return `${anoAtual}-${ods_objeto}-${novoNumeroSequencial}`;
}


module.exports = gerarIdDemanda;