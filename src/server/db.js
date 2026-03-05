// db.js – MongoDB connection using the native driver

const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "todoapp";

let client = null;
let db = null;

/**
 * Connects to MongoDB and caches the client and database instance.
 * Call this once at server startup.
 * @returns {Promise<import("mongodb").Db>} The database instance
 */
async function connectToDb() {
  if (db) {
    return db;
  }

  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment variables.");
  }

  client = new MongoClient(uri);

  try {
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to MongoDB (database: ${dbName})`);
    return db;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
}

/**
 * Returns the cached database instance. Must call connectToDb() first.
 * @returns {import("mongodb").Db | null}
 */
function getDb() {
  return db;
}

/**
 * Closes the MongoDB connection. Useful for graceful shutdown.
 */
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("MongoDB connection closed.");
  }
}

module.exports = {
  connectToDb,
  getDb,
  closeConnection,
};
