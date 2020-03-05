const mongoose = require('../../config/mongo');

/**
 * 对话包
 */
var scheam = new mongoose.Schema({
    smsId: String,
    chatTitleName: String,
    createdAt: Date,
    updatedAt: Date,
    deleted: Boolean,
    deletedAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("Chat", scheam);