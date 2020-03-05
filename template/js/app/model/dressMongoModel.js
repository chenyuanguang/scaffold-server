const mongoose = require('../../config/mongo');

/**
 * 短信
 */
var scheam = new mongoose.Schema({
    createdAt: Date,
    updatedAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("Dress", scheam);