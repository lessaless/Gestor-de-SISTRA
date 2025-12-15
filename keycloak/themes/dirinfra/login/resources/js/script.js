/*
    O código abaixo é para trocar as imagens dinamicamente,
    cada dia que passa, uma é usada.
    Descomentar para usar.
*/

/* // Função para gerar o número de 0 a 9 com base nos dias desde epoch Unix
function gerarNumeroDeZeroANove() {
    const diasDesdeEpochUnix = Date.now() / (1000 * 60 * 60 * 24);
    const diasInteiros = Math.trunc(diasDesdeEpochUnix);
    const diasInteirosString = String(diasInteiros);
    return Math.abs(parseInt(diasInteirosString.slice(-1)));
}

// Função para redefinir a imagem de fundo
function redefinirImagemDeFundo() {
    const elemento = document.body;
    // pega a imagem de fundo para definir o caminho
    const backgroundImage = window.getComputedStyle(elemento).backgroundImage;

    // nova imagem
    const novoNumero = gerarNumeroDeZeroANove();
    const novaImagem = backgroundImage.replace(/bg\d\.jpg/, `bg${novoNumero}.jpg`);
    elemento.style.backgroundImage = novaImagem;
}

// Ao carregar a página
window.addEventListener('load', redefinirImagemDeFundo); */