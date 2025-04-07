"use strict";

const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Load environment variables with fallback
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || 12, 10);

// This is for demonstration purposes only.
// In a production environment, you should not commit this to your repository
// and use environment variables or a secure secret management system.
const MONGO_URL = process.env.MONGODB_URI || "mongodb://localhost:27017/nodegoat";

const _getConnection = async () => {
  return await MongoClient.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const _closeConnection = (client) => {
  if (client) {
    client.close();
  }
};

const parseResponse = (err, res, client) => {
  _closeConnection(client);
  if (err) {
    console.log("ERROR:");
    console.log(err);
    process.exit(0);
  } else if (res) {
    console.log("SUCCESS:");
    console.log(JSON.stringify(res));
    process.exit(0);
  }
};

const addUser = async (client, db, username, password) => {
  try {
    // Hash the password using environment variable for salt rounds
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Insert the user with the hashed password
    await db.collection("users").insertOne({
      userName: username,
      userPassword: hash,
      firstName: "Node Goat",
      lastName: "Admin",
      isAdmin: true,
    });
    
    console.log(`User ${username} created successfully`);
  } catch (err) {
    console.log(`Error creating user ${username}: ${err.message}`);
    throw err;
  }
};

const resetDb = async () => {
  let client;
  
  try {
    client = await _getConnection();
    const db = client.db();
    
    // Drop the database to clear all data
    await db.dropDatabase();
    console.log("Database dropped");
    
    // Add default admin user
    await addUser(client, db, "admin", "Admin_123");
    
    // Add additional users as needed
    await addUser(client, db, "user1", "User1_123");
    await addUser(client, db, "user2", "User2_123");
    
    console.log("Database reset completed successfully");
  } catch (err) {
    console.error("Error resetting database:", err);
  } finally {
    _closeConnection(client);
  }
};

// Execute database reset if this file is run directly
if (require.main === module) {
  resetDb();
}

// Export for testing or importing
module.exports = { resetDb };
