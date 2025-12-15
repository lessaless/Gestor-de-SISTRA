// checkCertExpiry.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const fs = require("fs");
const crypto = require("crypto");

const certPath = process.env.CAMINHO_CERTIFICADO;

if (!certPath) {
  console.error("Defina a variável CAMINHO_CERTIFICADO");
  process.exit(1);
}

try {
  const certPem = fs.readFileSync(certPath, "utf8");
  const x509 = new crypto.X509Certificate(certPem);

  console.log("Assunto:", x509.subject);
  console.log("Emissor:", x509.issuer);
  console.log("Válido de:", x509.validFrom);
  console.log("Válido até:", x509.validTo);

  const expiraEm = new Date(x509.validTo);
  const agora = new Date();
  const dias = Math.floor((expiraEm - agora) / (1000 * 60 * 60 * 24));

  if (dias < 0) {
    console.log("⚠️ O certificado já expirou.");
  } else {
    console.log(`⏳ Faltam ${dias} dias para expirar.`);
  }
} catch (err) {
  console.error("Erro ao ler certificado:", err.message);
}
