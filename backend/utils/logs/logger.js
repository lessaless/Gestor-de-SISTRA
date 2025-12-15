const path = require("path");
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const pastaLogs = path.join(__dirname, '../../logs');

const logger = createLogger({
    level: 'info',
    /* format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
    ), */
    format: format.combine(
        format.timestamp({
            format: () => new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false })
        }),
        format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
    ),
    transports: [
        new transports.DailyRotateFile({
            /* filename: 'utils/logs/log-files/%DATE%.log',//diretório com horário local */
            filename: path.join(pastaLogs, '%DATE%.log'),//diretório com horário local
            datePattern: 'YYYY-MM-DD',
            //maxFiles: '14d',//tempo de vida dos arquivos, após isso, exclui
            zippedArchive: false,//comprimir arquivos para economia de espaço
        }),
        //new transports.Console(),  // Opcional: Também imprime no console
    ],
});

module.exports = logger;
