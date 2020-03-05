const mongoose = require('../../config/mongo');

/**
 * 互动游戏
 */
var scheam = new mongoose.Schema({
    cartoonId: String,
    chapterId: String,
    chapterItemId: String,
    createdAt: Date,
    updatedAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("Game", scheam);