"use strict";

const crypto = require("crypto");

/* The SessionDAO must be constructed with a connected database object */
function SessionDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (!(this instanceof SessionDAO)) {
        console.log("Warning: SessionDAO constructor called without 'new' operator");
        return new SessionDAO(db);
    }

    const sessions = db.collection("sessions");

    this.startSession = async (userId, userName) => {
        const sessionId = crypto.randomBytes(16).toString("hex");
        
        await sessions.insertOne({
            _id: sessionId,
            userId: userId,
            userName: userName,
            created: new Date()
        });

        return sessionId;
    };

    this.getSession = async sessionId => {
        return await sessions.findOne({
            _id: sessionId
        });
    };

    this.updateSession = async (sessionId, userId, userName) => {
        await sessions.updateOne({
            _id: sessionId
        }, {
            $set: {
                userId: userId,
                userName: userName
            }
        });
    };

    this.deleteSession = async sessionId => {
        await sessions.deleteOne({
            _id: sessionId
        });
    };
}

module.exports = { SessionDAO };
