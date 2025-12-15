const verificarAssinatura = async (file) => {
  const assinaturasValidas = {
    '89504E': 'image/png',
    'FFD8FF': 'image/jpeg',
    '474946': 'image/gif',
    '424D38': 'image/bmp',
    '49492A': 'image/tiff',
  };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const buffer = event.target.result;
      const signature = new Uint8Array(buffer, 0, 3).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '').toUpperCase();
      if (assinaturasValidas[signature]) {
        //console.warn("Assinatura válida: ", assinaturasValidas[signature]);
        resolve(true);

      } else {
        reject({code: 'FILE_SIGNATURE', message: `Assinatura de arquivo inválida: ${signature}`});
      
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export default verificarAssinatura;