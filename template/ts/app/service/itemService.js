/*
 * @Author: your name
 * @Date: 2019-12-04 14:42:52
 * @LastEditTime : 2019-12-20 12:24:57
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/service/itemService.js
 */
const itemMongoModel = require('../model/itemMongoModel');
const chatMongoModel = require('../model/chatMongoModel');
const chatService = require('./chatService');

/**
 * 对话item
 */
class service {
    
    /**
     * 创建
     * @param {*} params 
     */
    async create(params) {
        const itemModel = new itemMongoModel(params);
        await itemModel.save();
        await chatService.changeChatStatus(params.chatId)
        return itemModel;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const item = await itemMongoModel.findOne({
            id: id
        });
        return item;
    }

    /**
     * 列表查询
     */
    async query(params) {
        const item = await itemMongoModel.find(params);
        return item;
    }

    /**
     * 更新
     */
    async update(id, params) {
        delete params.id;
        await itemMongoModel.update({
            id: id
        }, params);
        await chatService.changeChatStatus(params.chatId)
    }

    /**
     * 删除
     * @param {*} id 
     */
    async del(id) {
        let item=await itemMongoModel.findOne({id:id})
        await itemMongoModel.deleteOne({
            id: id
        });
        await chatService.changeChatStatus(item.chatId)
    }
}

module.exports = new service();