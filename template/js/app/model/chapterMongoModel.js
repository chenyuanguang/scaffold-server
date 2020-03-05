/*
 * @Author: your name
 * @Date: 2019-12-04 14:42:52
 * @LastEditTime: 2019-12-20 16:06:15
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/model/chapterMongoModel.js
 */
const mongoose = require('../../config/mongo');

/**
 * 章节
 */
var scheam = new mongoose.Schema({
    cartoonId: String,
    item: [{
        _id: false,
        id: String,
        url: String,
        chatId: String,
        voiceChatId:String,
        sceneChatId:String,
        interactionId: String
    }],
    createdAt: Date,
    updatedAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("Chapter", scheam);