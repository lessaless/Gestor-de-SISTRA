#!/bin/bash
export NODE_EXTRA_CA_CERTS=/home/dirinfra/Projetos/ca-completo.pem
cd /home/dirinfra/Projetos/Gestor-de-SISTRA/backend
exec node server.js