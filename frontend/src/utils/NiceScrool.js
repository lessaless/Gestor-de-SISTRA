// USADO APENAS PARA PÁGINA DE PRÉ-CADASTRO.
// rolagem suave.

window.addEventListener('wheel', (event) => {

    if (event.deltaY > 0) {
        // rolagem para baixo
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth',
        });

    } else if (event.deltaY < 0) {
        // rolagem para cima
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
    }
});