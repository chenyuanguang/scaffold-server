const mongoose = require('../../config/mongo');

/**
 * 对话包
 */
var scheam = new mongoose.Schema({
    chatId:String,
    smsId: String,
    chatTitleName: String,
    createdAt: Date,
    updatedAt: Date,
    deleted: Boolean,
    deletedAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("PublicChat", scheam);