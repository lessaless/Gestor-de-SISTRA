/*
    Retorna true se o valor estiver no padrão de ID esperado.
*/

const verificarPadraoId = (valor) => {
    // const regex = /^([a-z]+)-\d+-[A-Za-z]+-\d{4}$/; // com prefixo (LT-1-DIRINFRA-2025)
    const regex = /^\d+\/[A-Za-z]+\/\d{4}$/; // sem prefixo (1/DIRINFRA/2025)
    return regex.test(valor);
};

export default verificarPadraoId;