"use strict";

const bcrypt = require("bcrypt");
require("dotenv").config();

// Get work factor from environment or use default
const BCRYPT_WORK_FACTOR = parseInt(process.env.BCRYPT_WORK_FACTOR || "10", 10);

// Function to hash a password
const hashPassword = async (password) => {
    return await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
};

// Function to compare password with hash
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

module.exports = {
    hashPassword,
    comparePassword,
    BCRYPT_WORK_FACTOR
};
