const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { MongoClient } = require('mongodb');

//URL de conexão com o MongoDB
const mongoURI = process.env.MONGO_URI;

//Dados do administrador
const adminUsername = 'dirinfra';
const adminPassword = process.env.EMAIL_PASS;

//Função para criar o administrador
async function createAdmin() {

    try {
        const client = new MongoClient(mongoURI, { useUnifiedTopology: true });
        await client.connect();

        //Banco de dados onde para criar o administrador
        const dbName = 'admin';

        //Cria o administrador
        const adminDb = client.db(dbName).admin();

        await adminDb.addUser(adminUsername, adminPassword, {
            roles: [
                { role: 'userAdminAnyDatabase', db: dbName },
                'readWriteAnyDatabase',
            ],
        });
        console.log('Administrador criado com sucesso!');

    } catch (error) {
        console.error('Erro ao criar o administrador: ', error);
    }

}

createAdmin();

//db.createUser( { user: "admin", pwd: process.env.EMAIL_PASS, roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ] } );