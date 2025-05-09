"use strict";

const { MongoClient } = require("mongodb");
const { hashPassword } = require("../app/utils/passwordUtils");

// This is the default user data
const userDAO = require("../app/data/user-dao").UserDAO;
const USERS_TO_INSERT = require("./dummy_users").users;

// Connection URL
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nodegoat";

// Start connecting
MongoClient.connect(MONGODB_URI)
    .then(async client => {
        console.log("Connected successfully to server");
        
        // Get database and collections
        const db = client.db();
        const usersCol = db.collection("users");
        const allocationsCol = db.collection("allocations");
        const countersCol = db.collection("counters");
        const contributionsCol = db.collection("contributions");
        const sessionCol = db.collection("sessions");
        
        // Reset the collections
        try {
            await usersCol.drop();
            await allocationsCol.drop();
            await countersCol.drop();
            await contributionsCol.drop();
            await sessionCol.drop();
        } catch (e) {
            // Collections may not exist
            console.log("Error dropping collections: " + e.message);
        }
        
        // Insert the users
        const insertUsers = async () => {
            console.log("Inserting users");
            
            // Hash passwords before inserting
            const users = await Promise.all(
                USERS_TO_INSERT.map(async user => {
                    const hashedPassword = await hashPassword(user.password);
                    return { ...user, password: hashedPassword };
                })
            );
            
            await usersCol.insertMany(users);
            console.log("Users successfully inserted");
        };
        
        // Insert counters
        const insertCounters = async () => {
            console.log("Inserting counters");
            
            const counters = [
                { _id: "userId", seq: 3 }
            ];
            
            await countersCol.insertMany(counters);
            console.log("Counters successfully inserted");
        };
        
        // Run the insertions
        try {
            await insertUsers();
            await insertCounters();
            console.log("Database reset successful");
        } catch (e) {
            console.log("Error during database reset: " + e.message);
        }
        
        // Close the connection
        client.close();
        console.log("Database connection closed");
    })
    .catch(err => {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    });
