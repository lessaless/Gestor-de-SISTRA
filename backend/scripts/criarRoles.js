const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const Role = require('../modelos/roleModel');

// Conectar ao MongoDB
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const roles = [
    {
        _id: "admin_geral",
        nivel: 3,
        permissions: [
            "setaradmin_geral", "removeradmin_geral",
            "edicao_geral", "remocao_geral",
            "edicao_propria_geral", "remocao_propria_geral",
            "cadastramento_geral",
            
            "setaradmin_local", "removeradmin_local",
            
            "edicao_local", "remocao_local",

            "remocao_propria_local",
            "edicao_propria_local",
            "cadastramento_local",
            "leitura_geral"
        ]
    },
    {
        _id: "admin_local",
        nivel: 2,
        permissions: [
            "setaradmin_local", "removeradmin_local",

            "edicao_local", "remocao_local",

            "remocao_propria_local",
            "edicao_propria_local",
            "cadastramento_local",
            "leitura_geral"
        ]
    },
    {
        _id: "usuario_local",
        nivel: 1,
        permissions: [
            "remocao_propria_local",
            "edicao_propria_local",
            "cadastramento_local",
            "leitura_geral"
        ]
    },
    {
        _id: "visitante",
        nivel: 0,
        permissions: ["leitura_geral"] // Visitantes só podem visualizar, que já é liberado por padrão
    }
];

// Função para inserir ou atualizar roles
const seedRoles = async () => {
    try {
        for (const role of roles) {
            await Role.findByIdAndUpdate(role._id, role, { upsert: true, new: true });
        }
        console.log("\nRoles inseridos/atualizados com sucesso!\n");
        mongoose.connection.close();

    } catch (error) {
        console.error("\nErro ao inserir roles:", error, "\n");
        mongoose.connection.close();

    }
};

// Executar o seed
seedRoles();