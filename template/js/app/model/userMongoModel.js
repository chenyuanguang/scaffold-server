/*
 * @Author: your name
 * @Date: 2020-01-06 16:00:42
 * @LastEditTime : 2020-01-06 16:30:09
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/model/userMongoModel.js
 */
const mongoose = require('../../config/mongo');

/**
 * 短信
 */
var scheam = new mongoose.Schema({
    createdAt: Date,
    deleted: Boolean,
    deletedAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("User", scheam);