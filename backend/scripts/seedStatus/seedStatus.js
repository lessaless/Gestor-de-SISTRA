// scripts/seedStatus.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const fs = require("fs");

// use the same mongoose instance used by your multiDB helper
const mongoose = require("../../db/connect");
const { getDb, getModel } = require("../../db/multiDB");

// change these if needed (or set as env vars)
const TARGET_DB = process.env.SEED_TARGET_DB || "bibliotecatecnica";
const JSON_FILENAME = process.env.SEED_JSON || "status.json";
const COLLECTION_NAME = process.env.SEED_COLLECTION || "status";

async function connect() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}

async function seedStatus() {
  try {
    await connect();

    // get the db connection for bibliotecatecnica
    const targetDb = getDb(TARGET_DB);

    // Schema matching your screenshot: documents have a single "status" string
    // strict:false allows unexpected extra fields (safe for flexible JSON)
    const statusSchema = new mongoose.Schema({
      status: String,
    }, { strict: false });

    // create model attached to the target DB connection
    const Status = getModel(TARGET_DB, "Status", statusSchema, COLLECTION_NAME);

    // read JSON file from scripts/JSON/<JSON_FILENAME>
    const jsonPath = path.resolve(__dirname, "JSON", JSON_FILENAME);
    if (!fs.existsSync(jsonPath)) throw new Error(`JSON file not found: ${jsonPath}`);
    const statuses = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    // replace collection contents
    await Status.deleteMany({});
    if (Array.isArray(statuses) && statuses.length) {
      await Status.insertMany(statuses);
    } else if (statuses && typeof statuses === "object") {
      await Status.create(statuses);
    } else {
      console.log("No records found in JSON — nothing inserted.");
    }

    console.log(`✅ Seed complete: ${TARGET_DB}.${COLLECTION_NAME} (${Array.isArray(statuses) ? statuses.length : 1})`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding:", err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

seedStatus();
