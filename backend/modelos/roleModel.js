// const mongoose = require("mongoose");
const mongoose = require("../db/connect");
const { getModel } = require("../db/multiDB")

const RoleSchema = new mongoose.Schema({
    _id: {
        type: String
    },  // Exemplo: "admin_geral"
    
    nivel: {
        type: Number
    }, // Exemplo: 3
    
    permissions: {
        type: [String]
    } // Exemplo: ["edicao_local", "remocao_local", "edicao_geral"]
});

module.exports = getModel('bibliotecatecnica', 'Role', RoleSchema, 'roles');