const nodemailer = require("nodemailer");

const sendEmail = async ({assunto, mensagem, destinatario, remetente, reply_to, cc, bcc}) => {
	// Criação do transportador de email
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: 587, //Número vem da documentação,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
		tls: {
			rejectUnauthorized: false
		}
	})

	//Opções ao mandar email
	const options = {
		from: remetente,
		to: destinatario,
		subject: assunto,
		html: mensagem,
	} 

	if (reply_to) options.replyTo = reply_to;
	if (cc) options.cc = cc;
	if (bcc) options.bcc = bcc;

	//Enviar email
	transporter.sendMail(options, function (err, info) {
		if(err) {
			console.log(err)
		}
		// console.log(info)
	})
};

module.exports = sendEmail