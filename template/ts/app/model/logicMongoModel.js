const mongoose = require('../../config/mongo');

/**
 * 对话logic
 */
var scheam = new mongoose.Schema({
    id: String,
    chatId: String
}, { strict: false, versionKey: false});

module.exports = mongoose.model("Logic", scheam);