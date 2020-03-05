const mongoose = require('../../config/mongo');

/**
 * 打包版本
 */
var scheam = new mongoose.Schema({
    objectId: String,
    taskCode: String,
    packageName: String,
    version: String,
    status: Number,
    isRead: Boolean,
    err: String,
    createdAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("Package", scheam);