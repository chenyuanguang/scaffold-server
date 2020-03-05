const mongoose = require('../../config/mongo');

/**
 * 漫画
 */
var scheam = new mongoose.Schema({
    createdAt: Date,
    deleted: Boolean,
    deletedAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("Cartoon", scheam);