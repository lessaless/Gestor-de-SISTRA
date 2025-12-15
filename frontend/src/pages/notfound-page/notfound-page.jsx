import React, { useEffect, useRef } from 'react';
import './notfound-page.css';
import Sprite from './sprite.png';

function NotFoundPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Define as dimensões do canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //Carrega a imagem
    const sprite = new Image();
    sprite.src = Sprite;

    let xNuvemLonge = 0, xNuvemPertoFundo = 0, xNuvemPertoFrente = 0, xNuvemPertoAtras = 0;//posições
    let vNuvemPertoFrente = 3.5, vNuvemPertoFundo = vNuvemPertoFrente*0.5, vNuvemLonge = vNuvemPertoFrente/4;//velocidades

    function draw() {
      //redimensionar quando alterar tamanho da janela
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      //ctx.drawImage(imagem, coordXNaImg, coordYNaImg, tamXNaImg, tamYNaImg, posXCanvas, posYCanvas, tamX, tamY);
      
      /* Nuvem longe ao fundo */
      ctx.drawImage(sprite, 0, 1085, 2270, 1085, xNuvemLonge, 0, canvas.width, canvas.height);
      ctx.drawImage(sprite, 0, 1085, 2270, 1085, xNuvemLonge - canvas.width, 0, canvas.width, canvas.height);

      /* Nuvem perto ao fundo */
      ctx.drawImage(sprite, 0, 0, 4600, 1085, xNuvemPertoFundo, canvas.height / 5, canvas.width, canvas.height);
      ctx.drawImage(sprite, 0, 0, 4600, 1085, xNuvemPertoFundo - canvas.width, canvas.height / 5, canvas.width, canvas.height);

      /* Nuvem única perto atrás (volume da nuvem frente perto) */
      ctx.drawImage(sprite, 3068, 1085, 700, 260, xNuvemPertoAtras, canvas.height / 2 -100, 1000, 260);
      
      /* Avião */
      ctx.drawImage(sprite, 2300, 1085, 768, 260, canvas.width / 2 - 768/2, canvas.height / 2 - 260/3, 768, 260);

      /* Nuvem perto na frente */
      ctx.drawImage(sprite, 2300, 1355, 2300, 825, xNuvemPertoFrente, canvas.height / 5, canvas.width, canvas.height*1.1);
      ctx.drawImage(sprite, 2300, 1355, 2300, 825, xNuvemPertoFrente - canvas.width, canvas.height / 5, canvas.width, canvas.height*1.1);    
      
      xNuvemLonge += vNuvemLonge;
      xNuvemPertoFundo += vNuvemPertoFundo;
      xNuvemPertoFrente += vNuvemPertoFrente;
      xNuvemPertoAtras += vNuvemPertoFrente;

      if(xNuvemLonge > canvas.width) {
        xNuvemLonge = 0;
      }
      if(xNuvemPertoFundo > canvas.width) {
        xNuvemPertoFundo = 0;
      }
      if(xNuvemPertoAtras > canvas.width){
        xNuvemPertoAtras = -canvas.width;
      }
      if(xNuvemPertoFrente > canvas.width) {
        xNuvemPertoFrente = 0;
      }
      

      requestAnimationFrame(draw);
    }

    sprite.onload = () => {
      draw();
    };
  }, []);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} className="canvas" />
      <div className="message-container">
        <h1 className="message-header">[Error 404]: Mayday! Mayday! Mayday!</h1>
        <p className="message-body">
          Nossos engenheiros não construíram nenhum "aeroporto" para "pousar" aqui.
        </p>
        <p className="message-body">
          Por favor, aperte os cintos e verifique a rota novamente.
        </p>
        <p className="message-body">
          Se o problema persistir, não entre em pânico! <a href="/main/help">Entre em contato</a> ou <a href="/">volte para "terra firme"</a>.
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;