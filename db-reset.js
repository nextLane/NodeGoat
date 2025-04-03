"use strict";

const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
require("dotenv").config();

// This is your new function to generate a random password
function generateRandomPassword(length = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// Get database connection string from environment variable or use default
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nodegoat";

// Hash password with bcrypt
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function initUsers() {
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    console.log("Connected to database");
    
    const db = client.db();
    const usersCollection = db.collection("users");
    
    // Clear existing users
    await usersCollection.deleteMany({});
    
    // Generate random passwords for each user
    const adminPassword = generateRandomPassword();
    const userPassword = generateRandomPassword();
    
    // Create admin and user with hashed passwords
    const users = [
      {
        userName: "admin",
        firstName: "Node Goat",
        lastName: "Admin",
        password: await hashPassword(adminPassword),
        isAdmin: true
      },
      {
        userName: "user",
        firstName: "Node Goat",
        lastName: "User",
        password: await hashPassword(userPassword),
        isAdmin: false
      }
    ];
    
    // Insert users
    await usersCollection.insertMany(users);
    
    console.log("Database reset completed!");
    console.log("Admin user created with username 'admin' and a secure random password");
    console.log("Regular user created with username 'user' and a secure random password");
    console.log("Please set up your own users and passwords for production use");
    
  } catch (err) {
    console.error("Error resetting database:", err);
  } finally {
    await client.close();
  }
}

// Run the initialization
initUsers().catch(console.error);
