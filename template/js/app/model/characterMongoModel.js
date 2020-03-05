const mongoose = require('../../config/mongo');

/**
 * 角色
 */
var scheam = new mongoose.Schema({
    cartoonId: String,
    isProtagonist: Boolean,
    realName: String,
    roleName: String,
    avator: String,
    createdAt: Date,
    deleted: Boolean,
    deletedAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("Character", scheam);