const asyncHandler = require("express-async-handler");
const User = require("../modelos/userModel");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
    try {
        let token;

        // Check 1: Try to get token from cookies
        token = req.cookies?.dirinfraBiblioteca;

        // Check 2: If no cookie, try Authorization header
        if (!token && req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check 3: If no header, try custom header
        if (!token && req.headers['x-auth-token']) {
            token = req.headers['x-auth-token'];
        }

        console.log("=== AUTH DEBUG ===");
        console.log("Token found:", token ? "Yes" : "No");
        console.log("Token source:", 
            req.cookies?.dirinfraBiblioteca ? "Cookie" : 
            req.headers.authorization ? "Bearer Header" : 
            req.headers['x-auth-token'] ? "X-Auth-Token" : 
            "None"
        );

        if (!token) {
            res.status(401);
            throw new Error("Não autorizado, por favor faça login!");
        }

        // Verify token
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token verified for user ID:", verificado.id);

        // Get user from token
        const user = await User.findById(verificado.id).select("-senha");

        if (!user) {
            res.status(401);
            throw new Error("Usuário não encontrado!");
        }

        console.log("User authenticated:", user.SARAM, user.nome);
        req.user = user;
        next();

    } catch (error) {
        console.error("Auth error:", error.message);
        res.status(401);
        throw new Error("Não autorizado, por favor faça login!");
    }
});

module.exports = protect;