"use strict";

const { hashPassword, comparePassword } = require("../utils/passwordUtils");

/* The UserDAO must be constructed with a connected database object */
function UserDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (!(this instanceof UserDAO)) {
        console.log("Warning: UserDAO constructor called without 'new' operator");
        return new UserDAO(db);
    }

    const users = db.collection("users");

    this.getNextSequence = async id => {
        const ret = await db.collection("counters").findOneAndUpdate({
            _id: id
        }, {
            $inc: {
                seq: 1
            }
        }, {
            returnOriginal: false
        });

        return ret.value.seq;
    };

    this.getUserById = async userId => {
        return await users.findOne({
            _id: parseInt(userId)
        });
    };

    this.getUserByUserName = async username => {
        return await users.findOne({
            userName: username
        });
    };

    this.getUserByEmail = async email => {
        return await users.findOne({
            email: email
        });
    };

    this.addUser = async (userName, firstName, lastName, password, email) => {
        const userId = await this.getNextSequence("userId");
        const hashedPassword = await hashPassword(password);

        await users.insertOne({
            _id: userId,
            userName: userName,
            firstName: firstName,
            lastName: lastName,
            password: hashedPassword,
            email: email
        });

        return userId;
    };

    this.validateLogin = async (userName, password) => {
        const user = await this.getUserByUserName(userName);

        if (!user) {
            return false;
        }

        return await comparePassword(password, user.password);
    };

    this.updateUser = async (userId, firstName, lastName, ssn, dob, address, bankAcc, bankRouting) => {
        await users.updateOne({
            _id: parseInt(userId)
        }, {
            $set: {
                firstName: firstName,
                lastName: lastName,
                ssn: ssn,
                dob: dob,
                address: address,
                bankAcc: bankAcc,
                bankRouting: bankRouting
            }
        });
    };

    this.updatePassword = async (userId, newPassword) => {
        const hashedPassword = await hashPassword(newPassword);

        await users.updateOne({
            _id: parseInt(userId)
        }, {
            $set: {
                password: hashedPassword
            }
        });
    };
}

module.exports = { UserDAO };
