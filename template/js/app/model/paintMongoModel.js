const mongoose = require('../../config/mongo');

/**
 * 立绘
 */
var scheam = new mongoose.Schema({
    cartoonId: String,
    characterId: String,
    createdAt: Date,
    updatedAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("paint", scheam);