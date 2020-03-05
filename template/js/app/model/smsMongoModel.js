const mongoose = require('../../config/mongo');

/**
 * 短信
 */
var scheam = new mongoose.Schema({
    cartoonId: String,
    name: String,
    characters: Array,
    type: String,
    groupAvator: String,
    createdAt: Date,
    deleted: Boolean,
    deletedAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("Sms", scheam);