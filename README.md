# Gestor de Demandas

Este projeto utiliza o conjunto de tecnologias **MERN** (MongoDB, Express.js, React, Node.js).

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração Inicial](#configuração-inicial)
- [Instalação das Dependências](#instalação-das-dependências)
- [Ambiente de Desenvolvimento](#ambiente-de-desenvolvimento)
- [Configurações de Proxy](#configurações-de-proxy)
- [Autenticação](#autenticação)
- [Personalização Keycloak](#personalização-keycloak)

---

## Pré-requisitos

Antes de configurar e executar o projeto, verifique se os seguintes pré-requisitos estão instalados em sua máquina:

- **Node.js** - [Instalar Node.js](https://nodejs.org/)
- **Git** - [Instalar Git](https://git-scm.com/)
- **MongoDB** - [Instalar MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/)
- **MongoDB Compass (opcional)** - Interface gráfica para gerenciar MongoDB.
- **OpenSSL** - Necessário caso os certificados localizados na pasta `backend/certificado` apresentem problemas de autenticação. Utilize para gerar novos certificados.

## Configuração Inicial

1. **Clone o repositório:**

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd <NOME_DA_PASTA_DO_PROJETO>
   ```

2. **Configuração do MongoDB:**
   - Certifique-se de que o serviço MongoDB está rodando.

3. **Configuração dos Certificados:**
   - Se houver problemas com os certificados em `backend/certificado`, utilize o OpenSSL para gerar novos.
  
4. **Variáveis de desenvolvimento:**
   - Tanto no frontend, como no backend, há um `.env.example`. Deve ser criado um `.env` com seus valores alterados, conforme necessário.
   - Especial atenção para a string de conexão do MongoDB, inicialmente, deve ser configurada sem `user:password` e sem `authSource=admin`. Essas configurações devem ser adicionadas após a conexão bem sucedida com o projeto e a criação do admin. Para isso, executar na pasta `backend` (com o servidor ligado):
  
   ```bash
   node criarAdminMongoDB.js
   ```
   - Com o admin criado, muda-se a string de conexão, adicionando a autenticação.
   - No MongoDB Compass, editar a string de conexão `mongodb://user:password@localhost:27017/?authMechanism=DEFAULT`, onde user="dirinfra" e password=EMAIL_PASS do `.env`

## Instalação das Dependências

A instalação das dependências deve ser realizada separadamente para o frontend e backend.

#### 1. Instale as dependências do frontend e backend

No diretório raiz do projeto, navegue até cada pasta e execute um dos comandos abaixo, de acordo com o ambiente e possíveis conflitos de versões de pacotes:

**Nota:** Substitua `user` e `password` pelas credenciais usadas no navegador.

```bash
cd frontend
npm install --proxy http://user:password@proxyserver:port
# ou, se houver conflitos de versões de pacotes:
npm install --legacy-peer-deps --force --proxy=http://user:password@proxyserver:port
```

Repita o procedimento para o backend:

**Nota:** Substitua `user` e `password` pelas credenciais usadas no navegador.

```bash
cd ../backend
npm install --force --proxy http://user:password@proxyserver:port
# ou
npm install --legacy-peer-deps --force --proxy=http://user:password@proxyserver:port
```

#### 2. Versão do Node
Versão do Node a ser utilizada é a 18.13.
Eventualmente, com outra versão, pode ser gerado um erro, tal como:
`(node:3720) [DEP0040] DeprecationWarning: The punycode module is deprecated. Please use a userland alternative instead.`

## Ambiente de Desenvolvimento

Para iniciar o servidor em ambiente de desenvolvimento, siga as etapas abaixo. Lembre-se de configurar variáveis de ambiente, como a URL do banco de dados MongoDB e as chaves secretas de autenticação.

1. **Configurando o Backend:**
   - Verifique e configure as variáveis de ambiente necessárias no backend, criando um arquivo `.env` (caso necessário, solicite o modelo de `.env` com as variáveis obrigatórias).

2. **Iniciando o Backend:**
   - No diretório `backend`, inicie o servidor:

     ```bash
     npm start
     ```
     Caso apareça o erro 

3. **Configurando e Iniciando o Frontend:**
   - No diretório `frontend`, inicie a aplicação React:

     ```bash
     npm start
     ```


## Configurações de Proxy

#### Configurações de Proxy para o VSCode

- Abra o VSCode;
- Clique em "Manage" no canto inferior esquerdo (ícone de engrenagem);
- Procure por "settings.json" e abra o arquivo;
- Adicione ou altere as seguintes linhas:
```bash
{
    "http.proxyAuthorization": null,
    "http.proxy": "http://user:password@proxyserver:port",
    "https.proxy": "http://user:password@proxyserver:port",
    "http.proxyStrictSSL": false
}
```

#### Configuração de Proxy no Node.js

1. **Configurar o Proxy no NPM**:
   - Execute os comandos abaixo:
     ```bash
     npm config set proxy http://user:password@proxyserver:port
     npm config set https-proxy http://user:password@proxyserver:port
     ```

#### Configuração de Proxy no Git

1. **Configurar o Proxy Globalmente**:
   - Para configurar o proxy para todos os repositórios, use:
     ```bash
     git config --global http.proxy http://user:password@proxyserver:port
     git config --global https.proxy http://user:password@proxyserver:port
     ```

2. **Configurar o Proxy para um Repositório Específico**:
   - Navegue até a pasta do repositório e use os comandos:
     ```bash
     cd /caminho/do/seu/repositório
     git config http.proxy http://user:password@proxyserver:port
     git config https.proxy http://user:password@proxyserver:port
     ```

3. **Verificar as Configurações de Proxy**:
   - Para confirmar as configurações, use:
     ```bash
     git config --global --get http.proxy
     git config --global --get https.proxy
     ```

#### Configuração de Proxy no Sistema Operacional

No Windows

1. **Acessar Configurações de Proxy**:
   - Vá em **Configurações de Rede e Internet** > **Proxy**.
   - Verifique se o endereço e a porta do proxy estão corretos.

2. **Definir as Variáveis de Ambiente**:
   - Abra o Prompt de Comando e execute:
     ```bash
     setx HTTP_PROXY "http://user:password@proxyserver:port"
     setx HTTPS_PROXY "http://user:password@proxyserver:port"
     ```

No macOS ou Linux

1. **Acessar Configurações de Proxy**:
   - Vá em **Preferências do Sistema** > **Rede** > selecione a conexão ativa > **Avançado...** > **Proxies**.

2. **Definir as Variáveis de Ambiente**:
   - Abra o Terminal e execute:
     ```bash
     export HTTP_PROXY="http://user:password@proxyserver:port"
     export HTTPS_PROXY="http://user:password@proxyserver:port"
     ```

   - Para torná-las permanentes, adicione ao final do arquivo `~/.bashrc` ou `~/.zshrc`.

### Observação

- Se sua senha ou nome de usuário contiver caracteres especiais, pode ser necessário codificá-los. Por exemplo:
  - `@` para `%40`
  - `:` para `%3A`
  - `*` para `%2A`

Substitua `user`, `password`, `proxyserver`, e `port` pelos valores corretos da sua configuração de proxy.

## Autenticação

Durante o desenvolvimento, a autenticação de login é realizada com um usuário padrão genérico, automaticamente.

- **Senha, se necessária:** 123456 (O hash dessa senha já está configurado no backend)

**Em produção**, a autenticação é configurada para funcionar via **Keycloak** com Login Único da FAB.


## Personalização Keycloak

Se houver necessidade de personalizar os temas do Keycloak para a aplicação, fazer testes de autenticação ou outra simulação, aqui estão alguns passos básicos:

### Pré-requisitos:
- Baixar e instalar o **Java JDK** (Java Development Kit);
- Criar a **Variável de Ambiente do Sistema** `JAVA_HOME` com o caminho `<CAMINHO_JAVA/JDK_VERSÃO>` (não precisa inserir /bin, etc);
- Baixar o **Keycloak Server**.

### Inicializar o servidor:
- Em `<RAIZ_DO_PROJETO/backend/.env>`, mude o valor das variáveis ***NODE_ENV*** para `"prod"` e ***KEYCLOAK_URL*** para `"http://localhost:8080"`;
- No prompt de comando do PC, navegue até a pasta `<CAMINHO_KEYCLOAK/bin>`, e digite 
```bash
 kc.bat start-dev
 ```
 Se tudo estiver certo, o servidor escutará na porta 8080.

DICA: Crie um atalho de **kc.bat** copiando seu caminho, e depois, em **Propriedades**, altere o **Destino** adicionando `start-dev`. O resultado será algo como: `<CAMINHO_KEYCLOAK\bin\kc.bat start-dev>`.

### Login no Keycloak:
- Ao acessar no navegador `localhost:8080` pela primeira vez, será necessário criar uma conta de acesso admin ao Keycloak. Em *"username ou email"* digite o **CPF**, e depois insira a **senha** e sua confirmação.

Nota: O CPF informado deve coincidir com um CPF do banco de dados. Caso não tenha criado nenhum, pode usar o objeto *user* dentro de ***devMiddleware.js*** (copiar e colar no **MongoDB Compass**, na coleção *users*, dentro do banco de dados *biblioteca*).

### Configuração do keycloak para autenticação
- Após acessar a interface do **Keycloak**, no navegador, pode-se criar um *realm* ou configurar o *master*;
- Acessar no menu a opção **Clients**, e depois o botão **Create client**;
- Preencha o *Client ID* (identificador que será usado para distinguir a aplicação), depois clique em **Next** duas vezes, e adicione nos campos `valid redirect URIs` e em `web origins`, as seguintes:
```ENV
   https://localhost:PORT-NO-ENV-BACKEND/*
   http://localhost:PORT-NO-ENV-BACKEND/*
   https://IP-MÁQUINA:PORT-NO-ENV-BACKEND/*
   http://IP-MÁQUINA:PORT-NO-ENV-BACKEND/*
```
- Após, clique em **Save**;
- Em `<RAIZ_DO_PROJETO/backend>` deve ser criado o seguinte arquivo `keycloak.json`:
```JSON
{
	"realm": "master", //ou o nome do realm criado
	"auth-server-url": "http://localhost:8080",
	"ssl-required": "external",
	"resource": "clientID", //nome do Client ID
	"public-client": true,
	"confidential-port": 0
}
```
- Reinicie os servidores.

### Personalização de temas:
- Em `<RAIZ_DO_PROJETO/keycloak/themes>` há uma pasta chamada `dirinfra`, com uma subpasta chamada `login`. Cada tela deve ter uma pasta e configuração própria dentro da pasta do tema. Nesse caso, somente foi desenvolvida a tela de *login*, que é por onde os usuários acessam.

Dentro de cada subpasta, tem seu arquivo `theme.properties`:
```ENV
parent=keycloak.v2 #define que usará o tema keycloak.v2 como base
import=common/keycloak
styles=css/styles.css #usará o estilo especificado
scripts=js/script.js #usará o script especificado
locales=pt-BR,en #traduções devem constar na pasta messages (vide arquivos)
```

Basicamente, o tema personalizado acima usa a base do template *keycloak.v2*, e somente personaliza algumas partes do seu respectivo *login*, através da folha de estilos. Os templates do keycloak se encontram em `<RAIZ_DO_KEYCLOAK/lib/lib/main/org.keycloak.keycloak-themes-VERSÃO.jar>` (basta abrir com um descompactador, como WinRAR).

Para mais, acesse a [documentação](https://www.keycloak.org/documentation) ou o conteúdo específico sobre [temas](https://www.keycloak.org/docs/latest/server_development/index.html#_themes).

Para usar esse tema personalizado:
1. Copie a subpasta **"dirinfra"** para `<RAIZ_DO_KEYCLOAK/themes>`;
2. Acesse a interface do *Keycloak* no navegador;
3. Clique em *Realm Settings* (Configurações do Realm);
4. Acesse a guia *Themes*;
5. Nas opções de *Login themes*, escolha `dirinfra`, e clique em *Save*.
