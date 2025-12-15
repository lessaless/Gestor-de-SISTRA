import logoDIRINFRA from "../../imgs/DOM_DIRINFRA.png";

const corMsgResposta = "#1a237e"; // Azul escuro

export const templateMail = (report, respostaEmail) => {
    return `
        <div style="font-family: Arial, sans-serif; color: #333; font-size: 15px;">
            Prezado(a),<br/>
            Recebemos o seu chamado com os seguintes dados:<br/>
            <strong>Assunto</strong>: [${report.origem}] ${report.CATEGORIA}<br/>
            <strong>Mensagem original</strong>: "<i>${report.DESCRICAO.replace(/\n/g, "<br/>")}</i>"

            <hr style="margin: 24px 0;"/>

            <p style="color: ${corMsgResposta}">
                <strong>Resposta:</strong><br/>
                ${respostaEmail.replace(/\n/g, "<br/>")}
                <br/><br/>
                Respeitosamente,<br/>
                <tbody>
                <tr style="height: 84px; border-style: none;">
                <td style="width: 74.4688px; height: 84px; vertical-align: top;"><img src=${logoDIRINFRA} alt="logo DIRINFRA" /></td>
                <td style="width: 522.531px; height: 84px; border-style: none; vertical-align: top;">
                <strong style="color: ${corMsgResposta}">Seção de Análise de Dados da DIRINFRA</strong>
                <div style="color: ${corMsgResposta}">Diretoria de Infraestrutura da Aeronáutica</div>
                <div><span style="color: ${corMsgResposta}; font-family: Arial, sans-serif; font-size: 16px;">Tel: (11) 3382-6178</span></div>
                </td>
                </tr>
                </tbody>
            </p>
        </div>
    `.trim();
};
