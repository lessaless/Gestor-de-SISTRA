const multer = require("multer");
const fs = require("fs");
const pastaUpload = 'uploads';
const usarSubPasta = false;//se false, fica tudo na principal (pastaUpload)

const tamMaximo = 50;//tamanho máximo de arquivo permitido, em MB
const arquivosPermitidos = [
  // 'image/png', 
  // 'image/jpeg', 
  // 'image/jpeg', 
  // 'image/gif', 
  // 'image/gif', 
  // 'image/bmp', 
  // 'image/tiff', 
  // 'image/jpeg', 
  // 'image/jpeg', 
  'application/pdf', 
  // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
  // 'application/msword', 
  // 'application/zip', 
  // 'application/x-rar-compressed', 
  // 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];


// Formatar tamanho do arquivo
const fileSizeFormatter = (bytes, decimal) => {
	if (bytes === 0) {
		return "0 Bytes"
	}

	const dm = decimal || 2;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
	const index = Math.floor(Math.log(bytes) / Math.log(1024));

	return (
		parseFloat((bytes / Math.pow(1024, index)).toFixed(dm)) + " " + sizes[index]
	)
}

module.exports = {
  dest: pastaUpload,

  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      
      if (!fs.existsSync(pastaUpload)) {
        // Cria a pasta se não existir
        fs.mkdirSync(pastaUpload);
      }
      
      if(usarSubPasta){
        const subPasta = `${pastaUpload}/${req.body.titulo_demanda}`;
        if (!fs.existsSync(subPasta)) {
          fs.mkdirSync(subPasta);
        }
        cb(null, subPasta);

      } else cb(null, pastaUpload);
      
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),

  limits: {
    fileSize: tamMaximo * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {

    if(arquivosPermitidos.includes(file.mimetype)){
      cb(null, true);

    } else {
      cb(new Error("Formato de arquivo inválido!"));
      //cb(null, true);
    }
  },

  fileSizeFormatter: fileSizeFormatter,
  
};
