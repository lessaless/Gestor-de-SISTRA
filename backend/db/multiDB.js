// db/multiDb.js

const mongoose = require('./connect');

const cachedDbs = new Map();

/**
 * Retorna a conexão com o banco de dados MongoDB especificado.
 * Usa cache para evitar criar múltiplas instâncias.
 */
function getDb(dbName) {
  if (!cachedDbs.has(dbName)) {
    const db = mongoose.connection.useDb(dbName, { useCache: true });
    cachedDbs.set(dbName, db);
    // console.log(`[multiDB.js] Banco cacheado: ${dbName}`);
  }
  
  return cachedDbs.get(dbName);
}

/**
 * Cria ou retorna um modelo existente.
 * Evita criar o mesmo modelo múltiplas vezes.
 */
function getModel(dbName, modelName, schema, collectionName) {
  const db = getDb(dbName);
  
  // Se o modelo já existe neste banco, retorna ele
  if (db.models[modelName]) {
    return db.models[modelName];
  }
  
  // Caso contrário, cria o modelo
  return db.model(modelName, schema, collectionName);
}

module.exports = { getDb, getModel };