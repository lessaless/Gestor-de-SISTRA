export const templateWpp = (report) => {
    const numeroLimpo = report.detalhesContato.replace(/\D/g, "");
    let numero = numeroLimpo;

    if (numero.length === 13 && numero.startsWith("55")) {
        numero = numero.substring(2);
    } else if (numero.length === 11 && numero.startsWith("0")) {
        numero = numero.substring(1);
    }

    const mensagem = `
        Olá! Estamos entrando em contato em relação ao seu chamado: 

        Assunto: *[${report.origem}] ${report.CATEGORIA}*

        Mensagem original:
        _"${report.DESCRICAO}"_

        Por favor, responda por aqui para darmos continuidade.

        Respeitosamente,
        *Seção de Análise de Dados da DIRINFRA*.
    `.trim();

    return `https://wa.me/55${numero}?text=${encodeURIComponent(mensagem)}`;
};
