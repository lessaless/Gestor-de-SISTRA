const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { fileSizeFormatter, limits } = require("./fileUploadPlus");
const logger = require('../logs/logger');

const statusCor = {
    "erro": "\x1b[91m%s\x1b[0m",
    "sucesso": "\x1b[92m%s\x1b[0m",
    "alerta": "\x1b[93m%s\x1b[0m",
};

const assinaturasValidas = {
    '255044': 'pdf', // PDF
};

// const TAMANHO_MB = 50;
// const TAMANHO_MAX = TAMANHO_MB * 1024 * 1024;

const TAMANHO_MAX = limits.fileSize;

const verificarAssinatura = async (usuario, objArquivo) => {
    console.log("Tamanho máximo permitido: ", TAMANHO_MAX);
    const caminhoArquivo = objArquivo.path;
    const nomeArquivoSemUTF8 = objArquivo.originalname;
    const nomeArquivo = Buffer.from(nomeArquivoSemUTF8, 'latin1').toString('utf-8');
    const tipoArquivo = objArquivo.mimetype;
    const tamanhoArquivo = objArquivo.size;

    const buffer = fs.readFileSync(caminhoArquivo);
    const assinatura = buffer.toString('hex', 0, 3).toUpperCase();

    logger.info(`TRY: FILE - ${usuario}`);

    try {
        // Verifica tamanho
        if (tamanhoArquivo > TAMANHO_MAX) {
            fs.unlinkSync(caminhoArquivo);
            throw new Error(`Arquivo excede o tamanho permitido (${TAMANHO_MB} MB)!`);
        }

        // Verifica extensão original
        if (path.extname(nomeArquivo).toLowerCase() !== '.pdf') {
            fs.unlinkSync(caminhoArquivo);
            throw new Error('Extensão de arquivo não permitida');
        }

        // Verifica assinatura mágica
        if (!assinaturasValidas[assinatura]) {
            fs.unlinkSync(caminhoArquivo);
            throw new Error('Assinatura mágica inválida');
        }

        // Verifica tipo MIME real com import dinâmico
        const fileTypeModule = await import('file-type');
        const fromBuffer = fileTypeModule.fileTypeFromBuffer || fileTypeModule.default?.fromBuffer;

        if (typeof fromBuffer !== 'function') {
            throw new Error('file-type: função fromBuffer não encontrada');
        }

        const tipoDetectado = await fromBuffer(buffer);


        if (!tipoDetectado || tipoDetectado.ext !== 'pdf') {
            fs.unlinkSync(caminhoArquivo);
            throw new Error(`Tipo MIME real não corresponde: detectado ${tipoDetectado?.ext}`);
        }

        // Tenta parsear o PDF
        await pdfParse(buffer);

        // Verifica conteúdo textual para código malicioso
        const conteudoTexto = buffer.toString('utf8', 0, 10000).toLowerCase();
        if (conteudoTexto.includes('<script') || conteudoTexto.includes('<html')) {
            fs.unlinkSync(caminhoArquivo);
            throw new Error('Arquivo contém conteúdo HTML ou JavaScript embutido');
        }

        // Renomeia o arquivo com nova extensão e timestamp
        const novaExtensao = assinaturasValidas[assinatura];
        const objPath = path.parse(caminhoArquivo);
        const dataAtual = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const horaAtual = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString().slice(11, 19).replace(/:/g, '');
        const novoCaminhoENome = path.join(objPath.dir, `${dataAtual}-${horaAtual}.${novaExtensao}`);
        const resp = path.parse(novoCaminhoENome);

        fs.renameSync(caminhoArquivo, novoCaminhoENome);
        const novoNomeArquivo = resp.base;

        const msg = `Arquivo do usuário ${usuario} renomeado de '${nomeArquivo}' para '${novoNomeArquivo}'`;
        console.log(statusCor["sucesso"], '\n' + msg + '\n');
        logger.info(msg);

        const objResposta = {
            caminho: path.join(resp.dir, novoNomeArquivo),
            criado_por: usuario,
            tamanho: fileSizeFormatter(tamanhoArquivo, 2),
            tipo: tipoArquivo,
            titulo_arquivo: nomeArquivo,
        };

        return objResposta;

    } catch (error) {
        try {
            if (fs.existsSync(caminhoArquivo)) fs.unlinkSync(caminhoArquivo);
        } catch (_) { }
        const msg = `Erro ao processar arquivo do usuário ${usuario}: ${nomeArquivo}`;
        logger.error(msg);
        logger.error(error);

        console.error(statusCor["erro"], '\n' + msg);
        console.error(statusCor["erro"], error);
        return false;
    }
};

module.exports = verificarAssinatura;