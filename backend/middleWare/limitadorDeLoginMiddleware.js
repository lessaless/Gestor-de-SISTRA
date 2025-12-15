const rateLimit = require('express-rate-limit');

const limitadorDeLoginMiddleware = rateLimit({
		windowMs: 1 * 60 * 1000, // 1 minutos
		max: 200000, // limite de 200000 tentativas de login por windowMs
		message: "Você excedeu o número máximo de tentativas de login. Por favor, tente acessar o formulário novamente em 15 minutos."
	});

module.exports = limitadorDeLoginMiddleware;