#!/bin/bash
export NODE_EXTRA_CA_CERTS=/home/dirinfra/Projetos/ca-completo.pem
cd /home/dirinfra/Projetos/Autenticador/backend
exec node server.js