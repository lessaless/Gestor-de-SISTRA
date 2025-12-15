const Arquivo = require('../modelos/arquivoModel');

const verificarArquivo = async (req, res, next) => {
    try {
        const { a_nome, demanda, a_novonome } = req.body;
        const arquivoExistente = await Arquivo.findOne({ a_nome: a_nome, demanda: demanda });
        
        if (arquivoExistente) {
            console.log("Arquivo existente");
            
            if (a_novonome) {
                console.log("Novo nome");
                // Se a_novonome estiver presente, substituir o arquivo existente
                await Arquivo.findOneAndUpdate(
                    { a_nome: a_nome, demanda: demanda },
                    { a_nome: a_novonome, demanda: demanda, path: req.file.path }
                );
                next();

            } else {
                console.log("Sem novo nome");
                // Se a_novonome não estiver presente, informar ao usuário sobre a existência do arquivo
                res.status(409).json({ message: 'Já existe um arquivo com este nome. Deseja substituir ou criar uma cópia?' });
                
            }

        } else {
            console.log("Arquivo novo criado");
            next();

        }

    } catch (error) {
        console.error("Erro no middleware verificarArquivo:", error);
        res.status(500).json({ message: 'Erro interno do servidor' });

    }
};

module.exports = verificarArquivo;
