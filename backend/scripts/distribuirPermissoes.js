const path = require("path");
const logger = require("../utils/logs/logger")
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

// Importar modelo de usuário
const User = require("../modelos/userModel");

const MONGO_URI = process.env.USER_MONGO_URI;
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const atualizarUsuarios = async () => {
    logger.warn("Iniciando script de distribuição de Permissões...");
    try {
        const usuarios = await User.find();

        for (const user of usuarios) {
            let precisaAtualizar = false;
            let update = {};

            // Se não tem role, define como "usuario_local"
            if (!user.role) {
                update.role = "usuario_local";
                precisaAtualizar = true;
            }

            // Se não tem Permissoes ou não inclui "biblioteca"
            if (!Array.isArray(user.Permissoes)) {
                update.Permissoes = ["biblioteca"];
                precisaAtualizar = true;
            } else if (!user.Permissoes.includes("biblioteca")) {
                update.$addToSet = { Permissoes: "biblioteca" };
                precisaAtualizar = true;
            }

            if (precisaAtualizar) {
                await User.updateOne({ _id: user._id }, update);
                logger.info(`Usuário ${user.email || user.SARAM} atualizado: ${JSON.stringify(update)}`);
            }
        }

        logger.info("Todos os usuários verificados/atualizados com sucesso!");
        console.log("\nTodos os usuários verificados/atualizados com sucesso!");
        mongoose.connection.close();
    } catch (error) {
        logger.error(`Erro ao atualizar usuários: ${JSON.stringify(error)}`);
        console.error(`\nErro ao atualizar usuários: ${JSON.stringify(error)} \n`);
        mongoose.connection.close();
    }
};

atualizarUsuarios();