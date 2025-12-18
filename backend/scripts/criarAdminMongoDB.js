// Antes de importar para a máquina local.
// const path = require("path");
// require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// const { MongoClient } = require('mongodb');

// //URL de conexão com o MongoDB
// const mongoURI = process.env.MONGO_URI;

// //Dados do administrador
// const adminUsername = 'dirinfra';
// const adminPassword = process.env.EMAIL_PASS;

// //Função para criar o administrador
// async function createAdmin() {

//     try {
//         const client = new MongoClient(mongoURI, { useUnifiedTopology: true });
//         await client.connect();

//         //Banco de dados onde para criar o administrador
//         const dbName = 'admin';

//         //Cria o administrador
//         const adminDb = client.db(dbName).admin();

//         await adminDb.addUser(adminUsername, adminPassword, {
//             roles: [
//                 { role: 'userAdminAnyDatabase', db: dbName },
//                 'readWriteAnyDatabase',
//             ],
//         });
//         console.log('Administrador criado com sucesso!');

//     } catch (error) {
//         console.error('Erro ao criar o administrador: ', error);
//     }

// }

// createAdmin();

// //db.createUser( { user: "admin", pwd: process.env.EMAIL_PASS, roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ] } );

//  Após importar para a máquina local

require("dotenv").config();
const { MongoClient } = require("mongodb");

async function createAdmin() {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Conectado ao MongoDB");

        const adminDb = client.db("admin");

        const username = "dirinfra";
        const password = process.env.EMAIL_PASS || "senha_dev";

        // Verifica se o usuário já existe
        const users = await adminDb.command({ usersInfo: username });
        if (users.users && users.users.length > 0) {
            console.log(`Usuário "${username}" já existe. Nenhuma ação necessária.`);
            return;
        }

        // Cria o usuário admin
        await adminDb.command({
            createUser: username,
            pwd: password,
            roles: [
                { role: "userAdminAnyDatabase", db: "admin" },
                { role: "readWriteAnyDatabase", db: "admin" },
                { role: "dbAdminAnyDatabase", db: "admin" }
            ]
        });

        console.log(`✅ Usuário administrador "${username}" criado com sucesso.`);
    } catch (err) {
        console.error("Erro ao criar o administrador:", err);
    } finally {
        await client.close();
    }
}

createAdmin();
