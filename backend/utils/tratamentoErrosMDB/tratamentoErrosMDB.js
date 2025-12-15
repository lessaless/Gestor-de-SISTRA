/*
   Recebe objeto de erro e devolve erros conhecidos do modelo mongoose.
   Funciona para:
   - unique: não permite duplicidade;
   - match: padrão do campo aceito;
   - required: campo obrigatório.
*/

const tratamentoDeErrosMDB = (erro, res) => {
    if (erro.errors) {
        // Se houver erros de validação
        const mensagensErro = [];
        for (let campo in erro.errors) {
            mensagensErro.push(erro.errors[campo].message);
        }
        res.status(400);
        return "Erro de validação: " + mensagensErro.join(', ');

    } else if (erro.code === 11000 || erro.code === 11001) {
        const campoDuplicadoLista = identificaCampoEValor(erro);
        
        if(campoDuplicadoLista[0] === 'sucesso'){
            const campoDuplicado = campoDuplicadoLista[1];
            const valorDuplicado = campoDuplicadoLista[2];
            res.status(400);
            return `Erro: Não é aceito duplicar o campo '${campoDuplicado}'! O valor '${valorDuplicado}' já existe.`;

        } else {
            res.status(400);
            return campoDuplicadoLista[1];
        }

    } else {
        // Outros tipos de erros
        console.error(erro);
        res.status(500);
        return "STATUS: 500 - Erro interno do servidor - Outros tipos de erros.";

    }
};

const identificaCampoEValor = (erro) => {
    console.log(`O valor de Erro em identificaCampoEValor é ${erro}`)
    try {
        const regexPadraoErro = /index: (.+?) dup key/;
        const listaErro = erro.errmsg.match(regexPadraoErro).input;//input tem os nomes
        const regexChaveValor = /\{\s*(\w+)\s*:\s*"([^"]*)"\s*\}/g;//{chave: "valor"}
        const campoLista = regexChaveValor.exec(listaErro);
        const campo = campoLista[1];
        const valor = campoLista[2];
        return ['sucesso', campo, valor];

    } catch (error) {
        return ['erro', `Erro: Objeto já existe. ${error}`]
    }
}

module.exports = tratamentoDeErrosMDB;