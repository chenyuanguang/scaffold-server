/*
 * @Author: your name
 * @Date: 2019-12-24 15:48:17
 * @LastEditTime : 2019-12-31 16:27:46
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/model/publicCartoonMongoModel.js
 */
const mongoose = require('../../config/mongo');

/**
 * 漫画
 */
var scheam = new mongoose.Schema({
    createdAt: Date,
    deleted: Boolean,
    deletedAt: Date,
    cartoonId:String
}, { strict: false, versionKey: false});

module.exports = mongoose.model("PublicCartoon", scheam);