const asyncHandler = require("express-async-handler")
const Report = require("../modelos/reportModel")
const sendEmail = require("../utils/email/sendEmail");

//Registrar report
const registrarReport = asyncHandler(async (req, res) => {
    const { DESCRICAO, CATEGORIA, origem, preferenciaContato, detalhesContato } = req.body
    const SARAM = req.user.SARAM

    //Criação de um novo report
    const report = await Report.create({
        origem,
        DESCRICAO,
        CATEGORIA,
        SARAM,
        preferenciaContato,
        detalhesContato
    });

    if (report) {
        const { SARAM, DESCRICAO, CATEGORIA, detalhesContato, preferenciaContato } = report
        res.status(201).json({
            CATEGORIA, SARAM, DESCRICAO, preferenciaContato, detalhesContato
        })
    } else {
        res.status(400)
        throw new Error("Erro ao registrar report")
    }
});

const lerReports = asyncHandler(async (req, res) => {
    const reportsRegistrados = await Report.find({});
    return res.status(200).json(reportsRegistrados);
});

const atualizarReports = asyncHandler(async (req, res) => {
    const { id, resolvido } = req.body;

    if (!id) {
        res.status(400);
        throw new Error("ID do report é obrigatório");
    }

    const reportAtualizado = await Report.findByIdAndUpdate(
        id,
        { resolvido: resolvido },
        { new: true }
    );

    if (!reportAtualizado) {
        res.status(404);
        throw new Error("Report não encontrado");
    }

    res.status(200).json(reportAtualizado);
});

const enviarEmailReport = asyncHandler(async (req, res) => {

    const { destinatario, assunto, mensagem } = req.body;

    if (!destinatario || !assunto || !mensagem) {
        res.status(400);
        throw new Error("Todos os campos são obrigatórios: 'destinatario', 'assunto' e 'mensagem'.");
    }

    const remetente = process.env.EMAIL_USER;

    try {
        await sendEmail({ assunto, mensagem, destinatario, remetente, bcc: remetente });//bcc = cópia oculta, para salvar no e-mail do Portal
        res.status(200).json({ success: true, message: "Email enviado com sucesso" });

    } catch (error) {
        console.error("Erro ao enviar email:", error);
        res.status(500);
        throw new Error("Erro ao enviar o email");
    }
});

module.exports = {
    registrarReport,
    lerReports,
    atualizarReports,
    enviarEmailReport
};