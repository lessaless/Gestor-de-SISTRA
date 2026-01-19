// seedRoles.js - Script para criar as roles no banco de dados

const mongoose = require("./db/connect");
const { getModel } = require("./db/multiDB");

const RoleSchema = new mongoose.Schema({
    _id: { type: String },
    nivel: { type: Number },
    permissions: { type: [String] }
});

const Role = getModel('bibliotecatecnica', 'Role', RoleSchema, 'roles');

const roles = [
    {
        _id: "admin_geral",
        nivel: 5,
        permissions: [
            "leitura_geral",
            "cadastramento_geral",
            "edicao_geral",
            "edicao_propria_geral",
            "remocao_geral",
            "remocao_propria_geral",
            "setaradmin",
            "removeradmin"
        ]
    },
    {
        _id: "admin_local",
        nivel: 4,
        permissions: [
            "leitura_geral",
            "cadastramento_local",
            "edicao_local",
            "edicao_propria_local",
            "remocao_local",
            "remocao_propria_local",
            "setaradmin",
            "removeradmin"
        ]
    },
    {
        _id: "usuario_geral",
        nivel: 3,
        permissions: [
            "leitura_geral",
            "cadastramento_geral",
            "edicao_propria_geral",
            "remocao_propria_geral"
        ]
    },
    {
        _id: "usuario_local",
        nivel: 2,
        permissions: [
            "leitura_local",
            "cadastramento_local",
            "edicao_propria_local",
            "remocao_propria_local"
        ]
    },
    {
        _id: "leitor_geral",
        nivel: 1,
        permissions: [
            "leitura_geral"
        ]
    },
    {
        _id: "leitor_local",
        nivel: 0,
        permissions: [
            "leitura_local"
        ]
    }
];

async function seedRoles() {
    try {
        console.log("🌱 Iniciando seed das roles...");

        // Limpa a coleção (opcional - remova se quiser manter roles existentes)
        // await Role.deleteMany({});
        // console.log("🗑️  Roles antigas removidas");

        // Insere as roles
        for (const roleData of roles) {
            const exists = await Role.findById(roleData._id);
            if (exists) {
                console.log(`⚠️  Role ${roleData._id} já existe, pulando...`);
                continue;
            }
            
            await Role.create(roleData);
            console.log(`✅ Role ${roleData._id} criada com sucesso`);
        }

        console.log("\n🎉 Seed concluído com sucesso!");
        console.log("\n📋 Roles disponíveis:");
        const allRoles = await Role.find({}).sort({ nivel: -1 });
        allRoles.forEach(role => {
            console.log(`\n   ${role._id} (nível ${role.nivel}):`);
            console.log(`   Permissões: ${role.permissions.join(', ')}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Erro ao criar roles:", error);
        process.exit(1);
    }
}

// Executa o seed
seedRoles();