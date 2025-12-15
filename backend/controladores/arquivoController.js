const asyncHandler = require('express-async-handler');
const Arquivo = require('../modelos/arquivoModel');
const validarArquivo = require('../utils/validacaoArquivo/validatePosFileUpload');

const fs = require('fs');
const path = require('path');

const uparArquivo = asyncHandler(async (req, res) => {

    const user = req.user.SARAM;
    const criado_por = req.body.criado_por || user;
    const arquivo = req.file;

    if (!criado_por) {
        res.status(400);
        throw new Error(`Usuário não identificado para cadastro!`);
    }

    if (!arquivo) {
        res.status(400);
        throw new Error(`Arquivo não recebido para cadastro!`);
    }

    const arquivoValido = await validarArquivo(criado_por, arquivo);
    if (!arquivoValido) {
        res.status(400);
        throw new Error(`Arquivo inválido!`);
    }

    const arquivoBson = await Arquivo.create(arquivoValido);
    res.status(201).json({ arquivo_id: arquivoBson._id });//para registrar nos dados atrelados a este arquivo
})


const baixarArquivo = asyncHandler(async (req, res) => {

    id = req.params.id;

    if (id) {
        const objArquivo = await Arquivo.findById(id);
        if (objArquivo) {
            objArquivo.downloads++;
            await objArquivo.save();
            res.download(objArquivo.caminho, objArquivo.titulo_arquivo);

        } else {
            res.status(404);
            throw new Error(`Arquivo não encontrado!`);

        }

    } else {
        res.status(400);
        throw new Error(`ID do arquivo não fornecido ou fornecido incorretamente!`);

    }

});


const buscarArquivo = asyncHandler(async (req, res) => {

    id = req.params.id;
    if (id) {
        const objArquivo = await Arquivo.findById(id, "_id titulo_arquivo");
        if (objArquivo) {
            return res.status(200).json(objArquivo);

        } else {
            res.status(404);
            throw new Error(`Arquivo não encontrado!`);

        }

    } else {
        res.status(400);
        throw new Error(`ID do arquivo não fornecido ou fornecido incorretamente!`);

    }

});


const deletarArquivo = asyncHandler(async (req, res) => {

    const { id, modo } = req.query;

    if (modo === 'metadados') {//metadados vem do Controller de atualizar/remover dados, não retorna resposta

        if (!id) {
            return console.error('ID do arquivo não fornecido ou fornecido incorretamente!');

        }

        const objArquivo = await Arquivo.findById(id);

        if (!objArquivo) {
            return console.error('Arquivo não encontrado!');

        }
        const caminhoArquivo = path.join(__dirname, '..', objArquivo.caminho);

        fs.unlink(caminhoArquivo, (err) => {

            if (err) {
                return console.error('Erro ao remover o arquivo físico: ', err);

            } else {
                console.log('Arquivo físico removido com sucesso: ', caminhoArquivo);

            }

        });
        const resp = await objArquivo.deleteOne();

        if (resp.deletedCount === 0) {
            return console.error('Erro ao deletar o arquivo: ' + id);

        }
        return console.log('Arquivo deletado com sucesso do Banco de Dados: ' + id);


    } else {//Requisições diretas

        if (!id) {
            res.status(400);
            throw new Error('ID do arquivo não fornecido ou fornecido incorretamente!');
        }

        const objArquivo = await Arquivo.findById(id);

        if (!objArquivo) {
            res.status(404);
            throw new Error('Arquivo não encontrado!');
        }

        const caminhoArquivo = path.join(__dirname, '..', objArquivo.caminho);

        fs.unlink(caminhoArquivo, (err) => {
            if (err) {
                res.status(500);
                throw new Error(`Erro ao remover o arquivo físico: ${err}`);
            }
        });

        const resp = await objArquivo.deleteOne();

        if (resp.deletedCount === 0) {
            res.status(500);
            throw new Error(`Erro ao deletar o arquivo: ${id}`);
        }
        
        return res.status(204).json({message: 'Arquivo deletado com sucesso!'});
    }
});



module.exports = {
    baixarArquivo,
    buscarArquivo,
    uparArquivo,
    deletarArquivo
}