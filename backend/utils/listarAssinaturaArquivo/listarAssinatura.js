//Arquivo para testar as assinaturas de arquivos
//Não é usado no projeto

const fs = require('fs');
const path = require('path');

const statusCor = {
    "erro": "\x1b[91m%s\x1b[0m",
    "sucesso": "\x1b[92m%s\x1b[0m",
    "alerta": "\x1b[93m%s\x1b[0m",
}

const pasta = './arquivosTeste';

fs.readdir(pasta, (err, arquivos) => {
    if (err) {
        console.error(`Erro ao listar arquivos na pasta: ${err}`);
        return;
    }
    
    let i = 0;
    arquivos.forEach((arquivo) => {
        
        const caminhoArquivo = path.join(pasta, arquivo);

        fs.readFile(caminhoArquivo, (err, dados) => {
            i++;
            if (err) {
                console.error(statusCor["erro"],`[${i}] Erro ao ler arquivo ${arquivo}: ${err}`);
            } else {
                // Obtenha a assinatura dos primeiros 4 bytes como uma sequência hexadecimal
                const assinatura = dados.slice(0, 4).toString('hex').toUpperCase();
                console.log(statusCor["sucesso"],`[${i}] Assinatura: ${assinatura} - Arquivo: ${arquivo}`);
            }
        });
    });
});
