const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');

const User = require('../modelos/userModel');
const Dados_pessoais = require('../modelos/dados_pessoaisModel');
const PreUser = require('../modelos/preUserModel');

const logger = require('../utils/logs/logger');
const sendEmail = require('../utils/email/sendEmail');

// Diretório onde os arquivos de log estão armazenados
const LOG_DIRECTORY = path.join(__dirname, '../logs');

const getLogFiles = (req, res) => {
    fs.readdir(LOG_DIRECTORY, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao ler diretório de logs' });
        }
        // Filtrar arquivos de log
        const logFiles = files.filter(file => file.endsWith('.log'));
        res.json({ logFiles });
    });
};

const getLogFileContent = (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(LOG_DIRECTORY, filename);

    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Arquivo não encontrado' });
    }

    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });

    // Configura os headers para um streaming eficiente
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Passa o stream diretamente para a resposta
    stream.pipe(res);

    // Trata erros de leitura
    stream.on('error', (err) => {
        res.status(500).json({ error: 'Erro ao ler o arquivo' });
    });

    // Finaliza o streaming ao terminar a leitura
    stream.on('end', () => {
        res.end();
    });
};

const getPreCadastros = asyncHandler(async (req, res) => {
    try {
        const preUsers = await PreUser.find({});
        // Resultado final
        const resultado = preUsers.map(user => ({
            /* _id: user._id, */
            SARAM: user.SARAM,
            NOME: user.nome || "Desconhecido",
            POSTO: user.posto || "Desconhecido",
            OM: user.OM || "Desconhecida",
            DATA: user.createdAt,
            id: user._id
        }));

        res.status(200).json(resultado);

    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar pré-cadastros' });
    }
});

const aprovarPreCadastro = asyncHandler(async (req, res) => {
    const { id } = req.body;

    const dadosAutor = await Dados_pessoais.findOne({ SARAM: req.user?.SARAM });
    const { SARAM = "Desconhecido", POSTO = "Desconhecido", NOME = "Desconhecido" } = dadosAutor || {};
    const autor = { SARAM, POSTO, NOME };

    if (!id) {
        res.status(400)
        throw new Error("ID do pré-cadastro é necessário");
    }

    try {
        // Busca o pré-cadastro pelo ID
        const preUser = await PreUser.findById(id);
        if (!preUser) {
            res.status(400)
            throw new Error('Pré-cadastro não encontrado pelo id', id);
        }

        // Cria um novo usuário com os dados do pré-cadastro
        const newUser = new User({
            nome: preUser.nome,
            email: preUser.email,
            posto: preUser.posto,
            cpf: preUser.cpf,
            SARAM: preUser.SARAM,
            OM: preUser.OM,
            PoliticaDePrivacidade: preUser.PoliticaDePrivacidade,
            Permissoes: preUser.Permissoes,
            isAdmin: preUser.isAdmin,
            role: preUser.role
        });

        const newDadosPessoais = new Dados_pessoais({
            NOME: preUser.nome,
            POSTO: preUser.posto,
            SARAM: preUser.SARAM,
            QUADRO: preUser.quadro,
            OM: preUser.OM,
            ESP: preUser.esp,
            ULT_PROMO: preUser.ult_promo,
        })

        // Salva o novo usuário no banco de dados
        const userCadastrado = await newUser.save();
        if (!userCadastrado) {
            logger.error(`Erro ao criar usuário a partir do pré-cadastro: ${JSON.stringify(preUser)}`);
            res.status(500)
            throw new Error('Erro ao criar usuário a partir do pré-cadastro');
        }

        // Salva o novo usuário no banco de dados
        const dadosPessoaisCadastrado = await newDadosPessoais.save();
        if (!dadosPessoaisCadastrado) {
            logger.error(`Erro ao criar Dados Pessoais a partir do pré-cadastro: ${JSON.stringify(dadosPessoaisCadastrado)}`);
            res.status(500)
            throw new Error('Erro ao criar Dados Pessoais a partir do pré-cadastro');
        }

        // Remove o pré-cadastro após a aprovação
        const preUserRemovido = await PreUser.findByIdAndDelete(id);
        if (!preUserRemovido) {
            logger.error(`Erro ao remover pré-cadastro após aprovação: ${JSON.stringify(preUser)}`);
            res.status(500)
            throw new Error('Erro ao remover pré-cadastro após aprovação');
        }

        const remetente = process.env.EMAIL_USER;
        const destinatario = preUser.email;
        const assunto = "Pré-cadastro aprovado";
        const mensagem = `
            <h1>Olá, ${preUser.posto ? preUser.posto + ' ' : ''}${preUser.nome}!</h1>
            <p>Seu pré-cadastro foi aprovado com sucesso!</p>
            <p>Você já pode acessar o Portal DIRINFRA e suas aplicações permitidas.</p>
            <br/>
            <p>Respeitosamente,</p>
            <p><strong>Seção de Análise de Dados da DIRINFRA</strong></p>
        `;


        await sendEmail({ assunto, mensagem, destinatario, remetente, bcc: remetente });//bcc = cópia oculta, para salvar no e-mail do Portal
        logger.info(`Pré-cadastro aprovado por  ${autor.SARAM}/${autor.POSTO} ${autor.NOME}! Usuário e Dados Pessoais criados com sucesso: ${JSON.stringify(preUser)}`);
        return res.status(201).json({ message: 'Pré-cadastro aprovado e usuário criado com sucesso' });

    } catch (error) {
        logger.error(`Erro ao aprovar pré-cadastro: ${error.message}`);
        res.status(500)
        throw new Error('Erro ao aprovar pré-cadastro');

    }
});

const removerPreCadastro = asyncHandler(async (req, res) => {
    const { id } = req.query;

    const dadosAutor = await Dados_pessoais.findOne({ SARAM: req.user?.SARAM });
    const { SARAM = "Desconhecido", POSTO = "Desconhecido", NOME = "Desconhecido" } = dadosAutor || {};
    const autor = { SARAM, POSTO, NOME };

    if (!id) {
        res.status(400)
        throw new Error("ID do pré-cadastro é necessário");
    }

    try {
        // Busca o pré-cadastro pelo ID
        const preUser = await PreUser.findById(id);
        if (!preUser) {
            res.status(400)
            throw new Error('Pré-cadastro não encontrado');
        }

        // Remove o pré-cadastro
        const preUserRemovido = await PreUser.findByIdAndDelete(id);
        if (!preUserRemovido) {
            logger.error(`Erro ao remover pré-cadastro: ${JSON.stringify(preUser)}`);
            res.status(500)
            throw new Error('Erro ao remover pré-cadastro');
        }

        logger.warn(`Pré-cadastro removido por ${autor.SARAM}/${autor.POSTO} ${autor.NOME}: ${JSON.stringify(preUser)}`);
        return res.status(200).json({ message: 'Pré-cadastro removido com sucesso' });

    } catch (error) {
        logger.error(`Erro ao remover pré-cadastro: ${error.message}`);
        res.status(500)
        throw new Error('Erro ao remover pré-cadastro');
    }
});

module.exports = {
    getLogFiles,
    getLogFileContent,

    getPreCadastros,
    aprovarPreCadastro,
    removerPreCadastro
};
