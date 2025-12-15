// aviso.js
const http = require('http');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aviso - Sistema Atlas</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: #333;
        }
        .container {
          background: white;
          padding: 2rem 2.5rem;
          max-width: 650px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          border-radius: 8px;
          text-align: left;
        }
        h1 {
          font-size: 1.6rem;
          margin-bottom: 1rem;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 0.5rem;
        }
        p {
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        a {
          color: #0056b3;
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
        }
        .assinatura {
          font-size: 1rem;
          color: #555;
          margin-top: 2rem;
          border-top: 1px solid #e0e0e0;
          padding-top: 0.8rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Sistema Atlas desativado</h1>
        <p>Conforme <strong>Ofício nº 20/EPAD/3477</strong> - de 01 de agosto de 2025 - o sistema <strong>Atlas</strong> foi desativado em <strong>15 de agosto de 2025</strong>, devido à sua substituição pelo <strong>Acervo Técnico</strong>, disponibilizado para uso na mesma data.</p>
        <p>Você pode acessar o novo sistema no link abaixo:</p>
        <p><a href="https://www.biblioteca.portaldirinfra.intraer/" >Acessar o Acervo Técnico</a></p>
        <div class="assinatura">
          <strong>Seção de Análise de Dados da DIRINFRA</strong>
        </div>
      </div>
    </body>
    </html>
  `);
}).listen(8000, () => {
    console.log('Página de aviso disponível em http://www.atlas.portaldirinfra.intraer/');
});