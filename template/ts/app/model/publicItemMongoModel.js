/*
 * @Author: your name
 * @Date: 2019-12-04 14:42:52
 * @LastEditTime: 2019-12-17 12:15:19
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/model/itemMongoModel.js
 */
const mongoose = require('../../config/mongo');

/**
 * 对话item
 */
var scheam = new mongoose.Schema({
    id: String,
    chatId: String
}, { strict: false, versionKey: false});

module.exports = mongoose.model("PublicItem", scheam);