require("dotenv").config();
const express = require("express");
// const mongoose = require("mongoose");
const mongoose = require("./db/connect");
const bodyParser = require("body-parser");
const cors = require("cors");
const errorHandler = require("./middleWare/errorMiddleware.js");
const cookieParser = require("cookie-parser");
const path = require("path");
const rateLimit = require('express-rate-limit');
const https = require('https');
const fs = require('fs');
const Keycloak = require('keycloak-connect');
const keycloakAuthMiddleware = require("./middleWare/keycloakAuthMiddleware.js");
const session = require("express-session");

const userRoute = require("./rotas/userRoute.js");
const arquivoRoute = require("./rotas/arquivoRoute.js");
const crudRoute = require("./rotas/crudRoute.js");
const adminRoute = require("./rotas/adminRoute.js");
const reportRoute = require("./rotas/reportRoute.js");
const utilRoute = require("./rotas/utilRoute.js");
const demandaRoute = require("./rotas/demandaRoute.js");
const cnRoute = require("./rotas/cnRoute.js");
const etpeRoute = require("./rotas/etpeRoute.js");
const permissaoRoute = require("./rotas/permissaoRoute.js");

// const epadraoRoute = require("./rotas/epadraoRoute.js");

const devProtect = require("./middleWare/devMiddleware.js");
const atualizadosMiddleware = require("./middleWare/atualizadosMiddleware.js");
const logger = require("./utils/logs/logger.js");

const PROD = process.env.NODE_ENV !== 'dev';

mongoose.set('strictQuery', false);
const app = express()
//Desabilita a função de indicar que o app foi alimentado pelo express
app.disable('x-powered-by');
const PORT = process.env.PORT || 8000;

// const memoryStore = new session.MemoryStore();
const MongoStore = require('connect-mongo'); // Adicionado para substituir memoryStore

if (PROD) {
    app.use(session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }), // Usando MongoDB para armazenar sessões
        cookie: {
            sameSite: 'None',
            secure: true
        }
    }));
}

//Implementa o limite de requisições para todas as rotas
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 200000, // limite de 200000 requisições por windowMs
    message: "Você excedeu o número máximo de tentativas. Por favor, tente novamente mais tarde."
});
app.use(limiter);
// // Limite apenas para a rota de login
// app.post('/login', limiter, (req, res) => {
//     // Lógica de login
// });


// Tempo de espera máximo de 1 min e 40 segundos
app.set('server.timeout', 100000);


const keycloak = PROD ? (new Keycloak({
    // store: memoryStore,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }), //Usando MongoDB para armazenar sessões
    redirectUri: process.env.URL
})) : null;


const formatarURL = (input) => {
    if (!input) return null;

    // Garantir que há um protocolo válido para o URL parser funcionar
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
        input = 'https://' + input;
    }

    try {
        const hostname = new URL(input).hostname;
        const partes = hostname.split('.');

        // Sempre retornar os dois últimos níveis do domínio
        return partes.slice(-2).join('.');
    } catch (e) {
        console.warn("Erro ao formatar origem:", input);
        return null;
    }
};

const allowedOrigins = [// lista de origens permitidas
    process.env.URL,
    !PROD && process.env.URL_DEV
]
    .map(formatarURL)
    .filter(Boolean);// Remove valores falsy como null e undefined

app.use(cors({
    origin: function (origin, callback) {
        const formattedOrigin = formatarURL(origin);
        if (!origin || allowedOrigins.includes(formattedOrigin)) {
            return callback(null, true);
        }
        const objErro = {
            "origem": origin,
            "origens": allowedOrigins
        }
        return callback(new Error(`Origem não permitida: ${JSON.stringify(objErro)}`), false);
    },
    credentials: true, // habilita o uso de credenciais
    methods: ['GET', 'PATCH', 'PUT', 'POST', 'DELETE', 'OPTIONS'], // métodos permitidos
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With', 'X-HTTP-Method-Override'],
    exposedHeaders: ['Location']
}));

// Proteção extra contra CSRF baseada na origem da requisição
// Teste no CMD: curl -k --noproxy "*" "https://IP-SERVER/" -H "Origin: https://sitequalquer.com" -v

app.use((req, res, next) => {
    const origin = req.headers.origin;
    let extractedOrigin = origin;
    // const referer = req.headers.referer;

    /* if (!origin && referer) {// Se não houver origem, mas houver referer
        // Tenta extrair a origem do referer
        try {
            const url = new URL(referer);
            extractedOrigin = `${url.protocol}//${url.hostname}`;
            if (url.port) {
                extractedOrigin += `:${url.port}`;
            }
        } catch (error) {
            console.warn(`Erro ao processar Referer: ${referer}`);
        }
    } */

    const formatted = formatarURL(extractedOrigin);
    if (!formatted) {
        if (req.method !== 'GET') {
            logger.error("Requisição sem origem para método sensível:", req.method);
            return res.status(403).json({ error: "Origem ausente em requisição sensível" });
        }
        const isStaticFile = req.url.startsWith('/static/') || req.url.includes('/main/');
        if (!isStaticFile) {
            /* console.warn(`\n\n[Acervo Técnico]: Requisição sem origem, mas método seguro (GET), permitindo. - Detalhes: ${JSON.stringify({
                method: req.method,
                url: req.url,
                userAgent: req.headers['user-agent'],
                referer: req.headers.referer || 'Sem Referer',
                ip: req.ip
            })}`); */
        }
        return next();
    }

    // Verifica se a origem formatada está na lista de origens permitidas
    if (!allowedOrigins.includes(formatted)) {
        logger.error(`Origem não autorizada: ${formatted || "desconhecida"} - Detalhes: ${JSON.stringify({
            method: req.method,
            url: req.url,
            userAgent: req.headers['user-agent'],
            referer: req.headers.referer || 'Sem Referer',
            ip: req.ip
        })}`);
        logger.error(`Origens permitidas: ${JSON.stringify(allowedOrigins)}`);
        return res.status(403).json({ error: "Origem não autorizada" });
    }

    res.setHeader("Access-Control-Allow-Origin", extractedOrigin);
    next();
});


//Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
//app.use("/uploads", express.static(path.join(__dirname, "uploads")))

if (PROD) {

    // Middleware Keycloak
    app.use(keycloak.middleware({
        logout: '/logout',
        admin: '/admin',
        protected: '/protected',
        redirectTo: process.env.URL
    }));

    // Servir arquivos estáticos SEM proteção
    app.use(express.static(path.resolve(__dirname, '../', 'frontend', 'build'), {
        index: false, // Desabilita o arquivo index.html padrão
        setHeaders: (res, path) => {
            res.setHeader("Access-Control-Allow-Origin", process.env.URL);
        }
    }));

    app.use("/api/preusers", userRoute);//rota de pré-cadastro sem proteção

    app.use(keycloak.protect(), keycloakAuthMiddleware);

    app.get('/precadastro', keycloak.protect(), keycloakAuthMiddleware, (req, res) => {
        const indexPath = path.resolve(__dirname, '../', 'frontend', 'build', 'index.html');
        let html = fs.readFileSync(indexPath, 'utf8');
        const user = JSON.stringify({
            nome: req.user?.nome || null,
            email: req.user?.email || null,
            cpf: req.user?.cpf ? true : null,
            status: req.user?.status || null
        });

        html = html.replace('</head>', `<script>window.__USER__ = ${user};</script></head>`);
        res.send(html);
    });

    app.use(atualizadosMiddleware);

    // APIs protegidas
    app.use("/api/admin", adminRoute);
    app.use("/api/users", userRoute);
    app.use("/api/arquivo", arquivoRoute);
    app.use("/api/crud", crudRoute);
    app.use("/api/reports", reportRoute);
    app.use("/api/utils", utilRoute);
    app.use("/api/demandas", demandaRoute);
    app.use("/api/cns", cnRoute);
    app.use("/api/permissoes", permissaoRoute);
    app.use("/api/etpes", etpeRoute);
    // app.use("/api/epadrao", epadraoRoute);

    // Rota para servir o index.html do React
    // Com injection de user direto no index.js
    app.get('*', keycloak.protect(), keycloakAuthMiddleware, (req, res) => {
        const indexPath = path.resolve(__dirname, '../', 'frontend', 'build', 'index.html');
        let html = fs.readFileSync(indexPath, 'utf8');
        const user = JSON.stringify({
            nome: req.user?.nome || null,
            email: req.user?.email || null,
            cpf: req.user?.cpf ? true : null,
            status: req.user?.status || null,
        });

        html = html.replace('</head>', `<script>window.__USER__ = ${user};</script></head>`);
        res.send(html);
    });

} else {
    app.use(devProtect);

    app.use("/api/preusers", userRoute);//rota de pré-cadastro

    app.use("/api/admin", adminRoute);
    app.use("/api/users", userRoute);
    app.use("/api/arquivo", arquivoRoute);
    app.use("/api/crud", crudRoute);
    app.use("/api/reports", reportRoute);
    app.use("/api/utils", utilRoute);
    app.use("/api/demandas", demandaRoute);
    app.use("/api/cns", cnRoute);
    app.use("/api/permissoes", permissaoRoute);
    app.use("/api/etpes", etpeRoute);
}


//Error Middleware
app.use(errorHandler);


// Leia os arquivos de certificado e chave
const privateKey = fs.readFileSync(process.env.CAMINHO_CHAVE_PRIVADA, 'utf8');
const certificate = fs.readFileSync(process.env.CAMINHO_CERTIFICADO, 'utf8');

const credentials = { key: privateKey, cert: certificate };

// Crie o servidor HTTPS
const httpsServer = https.createServer(credentials, app);

// Conexão com o MongoDB e inicialização do servidor
console.info("Processo iniciado com ID:", process.pid);
console.log("Conectando-se ao Banco de Dados...");

const db = mongoose.connection;

db.on("error", (err) => {
    const code = err.code;
    const msg = err.message || "";

    if (code === "ECONNREFUSED" || msg.includes("ECONNREFUSED")) {
        console.error("MongoDB não está rodando ou a porta 27017 está fechada.");
        console.error("Tente iniciar com ('sudo systemctl start mongod' [linux] ou 'net start mongodb' [windows: cmd, como adm]) ou verifique se a porta 27017 está aberta.");
    } else if (code === "ENOTFOUND" || msg.includes("ENOTFOUND")) {
        console.error("Host do MongoDB não foi encontrado.");
    } else if (code === "ETIMEDOUT" || msg.includes("ETIMEDOUT")) {
        console.error("Conexão com MongoDB expirou.");
    } else {
        console.error("Erro inesperado ao conectar:", {
            name: err.name,
            code: err.code,
            message: err.message,
        });
    }

    logger.error(`[MongoDB] ${err.message}`);
});

db.once("open", () => {
    httpsServer.listen(PORT, () => {
        const msg = `Servidor HTTPS iniciado em ${PROD ? `PRODUÇÃO em ${process.env.URL}` : `DESENVOLVIMENTO na porta ${PORT}`}`;
        console.log(msg);
        logger.info(msg);
    });
});


//Aguardar as conexões serem encerradas para só então encerrar o servidor
const gracefulShutdown = () => {
    console.log(`\n\n[${new Date().toLocaleString()}] Sinal de encerramento recebido`);
    console.log('|- Aguardando finalização das conexões ativas...')
    logger.info(`Sinal de encerramento recebido`);
    logger.info('Aguardando finalização das conexões ativas...')
    httpsServer.close(() => {
        console.log(`[${new Date().toLocaleString()}] Encerramento concluído\n`);
        logger.info(`Encerramento concluído.`);
        process.exit();
    });
};
process.on('SIGTERM', gracefulShutdown);//kill PID
process.on('SIGINT', gracefulShutdown);//Ctrl+C

process.on('uncaughtException', (error, origin) => {
    console.log(`\n Origem: ${JSON.stringify(origin)}.\n Exceção não capturada:\n${error}`)
    logger.error(`\n Origem: ${JSON.stringify(origin)}.\n Exceção não capturada:\n${error}`)
})
process.on('unhandledRejection', (error, origin) => {
    console.log(`\n Origem: ${JSON.stringify(origin)}.\n Rejeição não tratada:\n${error}`)
    logger.error(`\n Origem: ${JSON.stringify(origin)}.\n Rejeição não tratada:\n${error}`)
})

// Exportar a instância do Keycloak para usar em outras partes do sistema
module.exports = keycloak;