const chatMongoModel = require('../model/chatMongoModel');
const publicChatMongoModel = require('../model/publicChatMongoModel');
const itemMongoModel = require('../model/itemMongoModel');
const logicMongoModel = require('../model/logicMongoModel');
const smsMongoModel = require('../model/smsMongoModel');
const publicCartoonMongoModel = require('../model/publicCartoonMongoModel');
const toolService = require('./jsonService/toolService');
const resourceService = require('./jsonService/resourceService');
const fs=require("fs")
const path=require("path")

/**
 * 聊天包
 */
class service {

    /**
     * 创建
     * @param {*} params 
     */
    async create(params) {
        params.createdAt = new Date();
        params.deleted = false;
        const chatModel = new chatMongoModel(params);
        await chatModel.save();
        await this.changeChatStatus(chatModel.get("id"))
        return chatModel;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const chat = await chatMongoModel.findById(id);

        if (!chat || chat.get('deleted')) {
            throw new Error('对话不存在');
        }

        const item = await itemMongoModel.find({ chatId: id });
        const logic = await logicMongoModel.find({ chatId: id });
        chat._doc.items = item;
        chat._doc.logics = logic;

        return chat;
    }

    /**
     * 更新
     */
    async update(id, params) {
        // 批量修改item
        if (params.items) {
            params.items.forEach((el) => el.chatId = id);
            await itemMongoModel.deleteMany({
                chatId: id
            });
            await itemMongoModel.collection.insertMany(params.items);

        }

        // 批量修改logics
        if (params.logics) {
            params.logics.forEach((el) => el.chatId = id);
            await logicMongoModel.deleteMany({
                chatId: id
            });
            if (params.logics.length > 0) {
                await logicMongoModel.collection.insertMany(params.logics);
            }
        }
        await this.changeChatStatus(id)

        delete params._id;
        delete params.deleted;
        delete params.smsId;
        delete params.items;
        delete params.logics;
        params.updatedAt = new Date();
        await chatMongoModel.update({
            _id: id
        }, params);
    }

    /**
     * 删除
     * @param {*} id 
     */
    async del(id) {
        const chat=await chatMongoModel.findById(id)
        console.log(chat.get("type"))
        if(chat.get("type")==undefined||chat.get('type')==0){
            await chatMongoModel.update({
                _id: id
            }, {
                deleted: true,
                deletedAt: new Date()
            });
        }else{
            throw new Error('对话包已发布不能删除')
        }
       
    }


    /**
    * 导出场景对话和语音聊天对话
    * @param {*} id 
    * @param {*} type
    */
    async exportScene(id) {

        const chat = await publicChatMongoModel.findOne({chatId:id});
        const sms = await smsMongoModel.findById(chat.get('smsId'));
        const cartoon = await publicCartoonMongoModel.findOne({cartoonId:sms.get('cartoonId')});

        // 创建资源包文件夹
        const packagePath = path.resolve(__dirname, `../../public/${cartoon.get('packageName')}.exportScene`);
        toolService.__rmdir(packagePath, true);
        fs.mkdirSync(packagePath);

        // 如果是场景对话或语音聊天，导出聊天包
        if (["scene", "voiceSingle"].includes(sms.get("type"))) {
            return await resourceService.__resourceChat(packagePath,id, sms.get("type"), cartoon.get('packageName'), 'zip');
        } else if(["single", "group"].includes(sms.get("type"))) {
            return await resourceService.__resourceChat(packagePath,id, "chat", cartoon.get('packageName'), 'zip');
        }
    }
    /**
     * @description: 更新对话包状态
     * @param {type} 
     * @return: 
     */
    async changeChatStatus(id) {

        await chatMongoModel.update({
            _id: id
        }, {
            status: 0
        })
    }

}

module.exports = new service();