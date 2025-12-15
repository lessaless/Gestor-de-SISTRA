const asyncHandler = require("express-async-handler")
const User = require("../modelos/userModel")
const PreUser = require("../modelos/preUserModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const Token = require("../modelos/tokenModel")
const crypto = require("crypto")
const sendEmail = require("../utils/email/sendEmail")
const logger = require("../utils/logs/logger")

//Geração do token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" })
};


//Registrar Usuário
const preRegisterUser = asyncHandler(async (req, res) => {


    const { posto, nome, email, SARAM, OM, quadro, esp, ult_promo, PoliticaDePrivacidade } = req.body

    let cpf = '';
    if (req.body.cpf === 'autenticado') {
        //para não expor o cpf no front, ele nunca é enviado
        //então quando é disponível no keycloak, manda true (server -> front) e define-se como 'autenticado' no front
        cpf = req.kauth.grant.id_token.content.preferred_username || '';//então recupera o cpf real aqui
    }

    if (PoliticaDePrivacidade == false) {
        res.status(400);
        throw new Error("Para continuar, é preciso estar de acordo com a Política de Privacidade!");
    }

    //Checkando se o email já existe
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error("Email já cadastrado")
    }

    //Checkando se SARAM já existe
    const saramExists = await User.findOne({ SARAM })
    if (saramExists) {
        res.status(400)
        throw new Error("SARAM já cadastrado")
    }

    //Criação do novo usuário
    const preUser = await PreUser.create({
        posto,
        nome,
        email,
        cpf,
        SARAM,
        OM,
        quadro,
        esp,
        ult_promo,
        PoliticaDePrivacidade
    });

    if (preUser) {
        logger.info(`Pré-cadastro realizado com sucesso: ${JSON.stringify(preUser)}`);
        res.status(201).json({
            message: "Pré-cadastro realizado com sucesso! Entraremos em contato após a validação dos dados.",
        })
    } else {
        logger.error(`Erro ao realizar pré-cadastro: ${JSON.stringify(preUser)}`);
        res.status(500)
        throw new Error("Erro interno do servidor, por favor tente novamente mais tarde")
    }
});

const verificarPreCadastro = asyncHandler(async (req, res) => {
    const { email, cpf } = req.query;
    if (!email && !cpf) {
        res.status(400)
        throw new Error("Email ou CPF são necessários para verificar o pré-cadastro");
    }

    // Verifica se o pré-cadastro existe pelo email ou CPF
    const preUser = await PreUser.findOne({ $or: [{ email }, { cpf }] });
    if (!preUser) {
        res.status(404)
        throw new Error('Pré-cadastro não encontrado');
    }

    // Retorna os dados do pré-cadastro
    const resultado = {
        SARAM: preUser.SARAM,
        NOME: preUser.nome || "Desconhecido",
        POSTO: preUser.posto || "Desconhecido",
        OM: preUser.OM || "Desconhecida",
    };

    return res.status(200).json(resultado);
});


//Registrar Usuário
const registerUser = asyncHandler(async (req, res) => {
    const { nome, email, senha, SARAM, PoliticaDePrivacidade } = req.body

    //Validações
    if (!nome || !email || !senha || !SARAM) {
        res.status(400)
        throw new Error("Por favor, preencha os campos requisitados")
    }

    //Validações de senha
    if (senha.length < 6) {
        res.status(400)
        throw new Error("A senha deve ter ao menos 6 caracteres")
    }

    // Verificar a presença de caracteres maiúsculos e minúsculos
    if (!(/[a-z]/.test(senha) && /[A-Z]/.test(senha))) {
        res.status(400);
        //console.log("Entrou no maiusculo")
        throw new Error("A senha deve conter pelo menos um caractere maiúsculo e um caractere minúsculo");
    }

    // Verificar a presença de um numeral
    if (!/[0-9]/.test(senha)) {
        res.status(400);
        throw new Error("A senha deve conter pelo menos um numeral");
    }

    // Verificar a presença de um caractere especial. Aqui, estou usando uma lista de caracteres comuns considerados especiais, mas você pode ajustar conforme necessário
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
        res.status(400);
        throw new Error("A senha deve conter pelo menos um caractere especial");
    }

    // Verificar se a senha contém o nome do usuário
    if (senha.toLowerCase().includes(nome.toLowerCase())) {
        res.status(400);
        throw new Error("A senha não deve conter seu nome");
    }

    if (SARAM.length < 7) {
        res.status(400)
        throw new Error("O SARAM deve ter mais de 6 caracteres")
    }
    if (PoliticaDePrivacidade == false) {
        res.status(400);
        throw new Error("Para continuar, é preciso estar de acordo com a Política de Privacidade!");
    }

    //Checkando se o email já existe
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error("Email já cadastrado")
    }

    //Checkando se SARAM já existe
    const saramExists = await User.findOne({ SARAM })
    if (saramExists) {
        res.status(400)
        throw new Error("SARAM já cadastrado")
    }

    //Criação do novo usuário
    const user = await User.create({
        nome,
        email,
        senha,
        SARAM,
        PoliticaDePrivacidade
    });


    //Criação de um Token para o usuário
    const token = generateToken(user._id)

    // Envia 0 HTTP-only cookie
    res.cookie("dirinfraBiblioteca", token, {
        path: "/",  //Homepage por padrão
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), //1 dia
        // sameSite: "none", 
        sameSite: "Strict",
        // secure: true,
    });

    if (user) {
        const { _id, nome, email, foto } = user
        res.status(201).json({
            _id, nome, email, foto, SARAM, token,
        })
    } else {
        res.status(400)
        throw new Error("Usuário inválido")
    }
});

//Logar usuário
const logarUsuario = asyncHandler(async (req, res) => {
    const { email, senha } = req.body
    //console.log(email, senha)

    //console.log("ENTROU EM LOGAR USUÁRIO")

    //Validação da requisição
    if (!email || !senha) {
        res.status(400);
        throw new Error("Insira um email e uma senha");
    }

    //Checar se o usuário existe na base de dados
    const user = await User.findOne({ email })
    if (!user) {
        res.status(400);
        throw new Error("Usuário não existe, por favor registre-se");
    }

    const senhaEstaCorreta = await bcrypt.compare(senha, user.senha)
    if (user && senhaEstaCorreta) {
        //Criação de um Token para o usuário
        const token = generateToken(user._id)

        // Envia 0 HTTP-only cookie
        /* res.cookie("token", token, {
            path: "/",  //Homepage por padrão
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), //1 dia
            sameSite: "none", 
            secure: true,
        }); */

        res.set('Authorization', `Bearer ${token}`);
        res.set('Access-Control-Expose-Headers', 'Authorization');
        // res.set('Set-Cookie', `dirinfraBiblioteca=${token}; Path=/; HttpOnly; Expires=${new Date(Date.now() + 1000 * 86400).toUTCString()}; SameSite=None; Secure`);
        res.set('Set-Cookie', `dirinfraBiblioteca=${token}; Path=/; HttpOnly; Expires=${new Date(Date.now() + 1000 * 86400).toUTCString()}; SameSite=Strict`);

        const { _id, nome, email, foto, SARAM } = user;
        res.status(200).json({
            _id,
            nome,
            email,
            foto,
            token,
            SARAM
        });
    } else {
        res.status(403);
        throw new Error("Senha incorreta")
    }

});

//Deslogar Usuário
const deslogarUsuario = asyncHandler(async (req, res) => {
    try {
        //console.log("Tentando deslogar");

        const logoutUrl = process.env.URL + '/logout';

        //console.log(`Logout URL: ${logoutUrl}`);

        // Redirecionar o usuário para a URL de logout do Keycloak
        res.redirect(logoutUrl);
    } catch (error) {
        console.error("Erro ao deslogar:", error);
        res.status(500).json({ message: 'Erro ao deslogar' });
    }
});


//Get Dados do usuário
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if (user) {
        const { _id, nome, email, foto, SARAM } = user
        res.status(200).json({
            _id, nome, email, foto, SARAM
        });
    } else {
        res.status(400)
        throw new Error("Usuário não encontrado")

    }


});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
    if (req.user) {
        return res.status(200).json({ OM: req.user.OM, nome: req.user.nome });

    } else {
        res.status(401);
        throw new Error("Usuário não autenticado!");

    }
});


// Update user
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    if (user) {
        const { nome, email, foto } = user;
        user.email = email;
        user.nome = req.body.nome || nome;
        user.foto = req.body.foto || foto;

        const updateUser = await user.save()
        res.status(200).json({
            _id: updateUser._id,
            nome: updateUser.nome,
            email: updateUser.email,
            foto: updateUser.foto,
        })
    } else {
        res.status(404)
        throw new Error("Usuário não encontrado")
    }
});


// Mudar Senha
const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)

    const { oldPassword, password } = req.body

    //Validação
    if (!user) {
        res.status(400)
        throw new Error("Usuário não encontrado, por favor registre-se")
    }

    if (!oldPassword || !password) {
        res.status(400);
        throw new Error("Por favor, insira a senha antiga e a senha nova")
    }

    // Checar se a senha antiga está correta
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.senha)

    // Salvar nova senha
    if (user && passwordIsCorrect) {
        user.senha = password
        await user.save()
        res.status(200).send("Senha alterada com sucesso")
    } else {
        res.status(400)
        throw new Error("Senha antiga incorreta")
    }

})

// Esquecer a senha
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body

    //Verificar se o email consta na base de dados
    const user = await User.findOne({ email })
    if (!user) {
        res.status(404)
        throw new Error("Usuário não existe")
    }

    //Apagar Token se este existir na base de dados
    let token = await Token.findOne({ userId: user._id })
    if (token) {
        await token.deleteOne()
    }

    //Resetar Token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
    //console.log(resetToken)


    //Hash do Token antes de salvar na base de dados
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    //Salvando na base de dados
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000) // 30 minutos
    }).save()

    // Construção da URL de recuperação de senha
    const resetURL = `${process.env.URL}/resetpassword/${resetToken}`

    // Email de recuperação
    const mensagem = ` 
        <p> Olá, <strong>${user.nome}</strong>!</p>
        <p> Por favor, use o link abaixo para recuperar a sua senha.</p>
        <p> O link é válido por 30 minutos.</p>

        <a href=${resetURL} clicktracking=off>RECUPERAR SENHA</a>

        <p> Atenciosamente, </p>
        <p> DIRINFRA </p>
    `
    const assunto = "Recuperação de Senha Biblioteca Técnica"
    const destinatario = user.email
    const remetente = process.env.EMAIL_USER

    try {
        await sendEmail(assunto, mensagem, destinatario, remetente)
        res.status(200).json({ success: true, message: "Email enviado" })
    } catch (error) {
        res.status(500)
        throw new Error("Email não enviado, por favor tente novamente")
    }

})

//Resetar a senha
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body
    const { resetToken } = req.params

    //Hashear o token e comparar com o Token da Base de dados
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    //Achar o token na base de dados
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() }
    })
    if (!userToken) {
        res.status(404)
        throw new Error("Token inválido ou expirado")
    }

    //Encontrar Usuário
    const user = await User.findOne({ _id: userToken.userId })
    user.senha = password
    await user.save()
    res.status(200).json({ message: "Senha alterada com sucesso" })
})

module.exports = {
    registerUser,
    logarUsuario,
    deslogarUsuario,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,

    preRegisterUser,
    verificarPreCadastro
};

