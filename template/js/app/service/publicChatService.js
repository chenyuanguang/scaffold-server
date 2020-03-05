const publicChatMongoModel = require('../model/publicChatMongoModel');
const publicItemMongoModel = require('../model/publicItemMongoModel');
const publicLogicMongoModel = require('../model/publicLogicMongoModel');
const chatMongoModel = require('../model/chatMongoModel');
const itemMongoModel = require('../model/itemMongoModel');
const logicMongoModel = require('../model/logicMongoModel');
const smsMongoModel = require('../model/smsMongoModel');
const cartoonMongoModel = require('../model/cartoonMongoModel');
const chapterMongoModel = require('../model/chapterMongoModel');
const resourceService = require('./jsonService/resourceService');
const commonChatService=require("./jsonService/commonChatService")
const jsonService=require("./jsonService/index")
const smsService=require("./smsService")
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
        const chatModel = new publicChatMongoModel(params);
        await chatModel.save();

        return chatModel;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const chat = await publicChatMongoModel.findById(id);

        if (!chat || chat.get('deleted')) {
            throw new Error('对话不存在');
        }

        const item = await publicItemMongoModel.find({ chatId: id });
        const logic = await publicLogicMongoModel.find({ chatId: id });
        chat._doc.items = item;
        chat._doc.logics = logic;

        return chat;
    }


    /**
     * 删除
     * @param {*} id 
     */
    async del(id) {
        await publicChatMongoModel.deleteOne({
            chatId: id
        });
    }


    /**
    * 导出场景对话和语音聊天对话
    * @param {*} id 
    * @param {*} type
    */
    async exportScene(id) {

        const chat = await publicChatMongoModel.findById(id);
        const sms = await smsMongoModel.findById(chat.get('smsId'));
        const cartoon = await cartoonMongoModel.findById(sms.get('cartoonId'));

        // 如果是场景对话或语音聊天，导出聊天包
        if (["scene", "voiceSingle"].includes(sms.get("type"))) {
            return await resourceService.__resourceChat(id, sms.get("type"), cartoon.get('packageName'), 'zip');
        }
    }
    /**
     * @description: 拉取聊天配置数据
     * @param {type} 
     * @return: 
     */
    async pull(cartoonId){

        let querySmsParams = {
            cartoonId: cartoonId,
            deleted: false
        }

        querySmsParams.type = {
            $in: ['single', 'group']
        }

        const sms = await smsMongoModel.find(querySmsParams);

        const smsJsons = [];

        for (let thisSms of sms) {
            // 短信json
            const smsJson = await commonChatService.__getSmsJson(thisSms.id);
            smsJsons.push(smsJson);
        }

        return smsJsons
    }


    /**
     * @description: 发布
     * @param {type} 
     * @return: 
     */
    async public(params) {
        const { id } = params
        // 如果已有发布过的版本，把旧数据删除掉
        const chat = await publicChatMongoModel.find({
            chatId: id
        });
        if (chat) {
            await publicChatMongoModel.remove({
                chatId: id
            })
            await publicItemMongoModel.remove({
                chatId: id
            })
            await publicLogicMongoModel.remove({
                chatId: id
            })
        }
        // 更改chat-web的状态 1:已经发布  0：更改或者创建后未发布
        //- status:0/1  ===> 0有更新（创建或修改后未发布），1无更新
        // - type:0/1/2  ===> 0:未分配   1:已发布到列表  2:已发布到章节
        await chatMongoModel.update({
            _id: id
        }, {
            status: 1,
            type:1
        })
        
        // 更新chat
        let updateChat = await chatMongoModel.findById(id)
        updateChat = updateChat.toObject()
        delete updateChat._id
        const chatModel = new publicChatMongoModel(Object.assign({}, updateChat, { chatId: id }));
        await chatModel.save();
        // 更新item
        const updateItems = await itemMongoModel.find({
            chatId: id
        })
        for (let iterator of updateItems) {
            iterator = iterator.toObject()
            delete iterator._id
            const itemModel = new publicItemMongoModel(iterator);
            await itemModel.save();
        }
        // 更新logic
        const updateLogics = await logicMongoModel.find({
            chatId: id
        })
        for (let iterator of updateLogics) {
            iterator = iterator.toObject()
            delete iterator._id
            const logicModel = new publicLogicMongoModel(iterator);
            await logicModel.save();
        }

        

        // 打包资源

        let sms=await smsService.find(updateChat.smsId)

        if(sms.get("type")=="group"||sms.get("type")=="single"){
            await jsonService.autoResource(sms.get("cartoonId"),"chat");
        }else if(sms.get("type")=="voiceSingle"){
            await jsonService.autoResource(sms.get("cartoonId"),"voice");
        }else{
            await jsonService.autoResource(sms.get("cartoonId"),sms.get("type"));
        }
         
        return "发布成功"
    }
    /**
    * @description: 检查是否在章节中使用
    * @param {type} 
    * @return: {status} 是否在章节中使用
    * @return: {chapterIndex} 所在章
    * @return: {nodeIndex} 所在节
    */
    async getChapterChatType(id, cartoonId) {
        const chapters = await chapterMongoModel.find({
            cartoonId: cartoonId
        });
        let chapterIndex = 0, nodeIndex = 0
        let status = chapters.some((item, index) => {
            chapterIndex = index
            let list = item.get("item")
            return list.some((jtem, jndex) => {
                nodeIndex = jndex
                return id == jtem.chatId || id == jtem.voiceChatId || id == jtem.sceneChatId
            })
        })
        return { status, chapterIndex, nodeIndex }
    }
    /**
     * @description: 发布章节，同步章节的语音等对话包
     * @param {type} 
     * @return: 
     */
    async syncChapter(cartoonId) {
        // 修改章节打包状态
        await cartoonMongoModel.update({
            _id:cartoonId
        },{
            chapterPackage:1
        })
        let chats = await chatMongoModel.find()
        for (const item of chats) {
            const id = item.get("id")
            const type = item.get("type")
            let { status, chapterIndex, nodeIndex } = await this.getChapterChatType(id, cartoonId)

            // 更改chat-web的状态 
            //  status===>1:已经发布  0：更改或者创建后未发布
            //  type===> 0:未分配  1：分配到列表  2：分配到章节
            //  text===> type=2时，才有此字段，描述当前对话的所在章节

            if (status) {
                console.log(status)
                await chatMongoModel.update({
                    _id: id
                }, {
                    type: 2,
                    text: chapterIndex + "," + nodeIndex,
                    status: 1
                })
            } else {

                if (type == 2) {
                    await chatMongoModel.update({
                        _id: id
                    }, {
                        type: 0,
                        status: 1,
                        text: ""
                    })
                }

            }
            // 只有新更新到章节的对话和从章节中移除的对话，才进行同步
            if (status || type == 2) {
                // 如果发布过，把旧数据删除掉
                const chat = await publicChatMongoModel.find({
                    chatId: id
                });
                if (chat) {
                    await publicChatMongoModel.remove({
                        chatId: id
                    })
                    await publicItemMongoModel.remove({
                        chatId: id
                    })
                    await publicLogicMongoModel.remove({
                        chatId: id
                    })
                }
                // 更新chat
                let updateChat = await chatMongoModel.findById(id)
                updateChat = updateChat.toObject()
                delete updateChat._id
                const chatModel = new publicChatMongoModel(Object.assign({}, updateChat, { chatId: id }));
                await chatModel.save();
                // 更新item
                const updateItems = await itemMongoModel.find({
                    chatId: id
                })
                for (let iterator of updateItems) {
                    iterator = iterator.toObject()
                    delete iterator._id
                    const itemModel = new publicItemMongoModel(iterator);
                    await itemModel.save();
                }
                // 更新logic
                const updateLogics = await logicMongoModel.find({
                    chatId: id
                })
                for (let iterator of updateLogics) {
                    iterator = iterator.toObject()
                    delete iterator._id
                    const logicModel = new publicLogicMongoModel(iterator);
                    await logicModel.save();
                }
            }
        }
        console.log("数据库数据同步成功")
       

        return "同步成功"
    }



    // =============     接口无用，测试同步数据使用           ======================



    /**
        * @description: 检查是否在章节中使用
        * @param {type} 
        * @return: {status} 是否在章节中使用
        * @return: {chapterIndex} 所在章
        * @return: {nodeIndex} 所在节
        */
    async getChatType(id) {

        const chat = await chatMongoModel.findById(id)
        const sms = await smsMongoModel.findById(chat.get('smsId'));
        if (!sms) {
            return false
        }
        const chapters = await chapterMongoModel.find({
            cartoonId: sms.get('cartoonId')
        });

        let chapterIndex = 0, nodeIndex = 0
        let status = chapters.some((item, index) => {

            chapterIndex = index
            let list = item.get("item")
            return list.some((jtem, jndex) => {
                // console.log(jtem.chatId,id)
                // console.log(jtem.voiceChatId,id)
                if (jtem.sceneChatId == id) {
                    console.log("scene:", jtem.sceneChatId, id)
                }
                if (jtem.chatId == id) {
                    console.log("chatId:", jtem.chatId, id)
                }
                if (jtem.voiceChatId == id) {
                    console.log("voice:", jtem.voiceChatId, id)
                }

                nodeIndex = jndex
                return id == jtem.chatId || id == jtem.voiceChatId || id == jtem.sceneChatId
            })
        })
        return { status, chapterIndex, nodeIndex }
    }

    /**
     * @description:手动数据同步接口
     * @param {type} 
     * @return: 
     */
    async sync() {
        let chats = await chatMongoModel.find()
        for (const item of chats) {
            const id = item.get("id")
            let { status, chapterIndex, nodeIndex } = await this.getChatType(id)

            // 更改chat-web的状态 
            //  status===>1:已经发布  0：更改或者创建后未发布
            //  type===> 0:未分配  1：分配到列表  2：分配到章节
            //  text===> type=2时，才有此字段，描述当前对话的所在章节
            if (status) {
                await chatMongoModel.update({
                    _id: id
                }, {
                    type: 2,
                    text: chapterIndex + "," + nodeIndex,
                    status: 1
                })
            } else {
                await chatMongoModel.update({
                    _id: id
                }, {
                    type: 1,
                    status: 1,
                    text: ""
                })
            }

            // 如果发布过，把旧数据删除掉
            const chat = await publicChatMongoModel.find({
                chatId: id
            });
            if (chat) {
                await publicChatMongoModel.remove({
                    chatId: id
                })
                await publicItemMongoModel.remove({
                    chatId: id
                })
                await publicLogicMongoModel.remove({
                    chatId: id
                })
            }
            // 更新chat
            let updateChat = await chatMongoModel.findById(id)
            updateChat = updateChat.toObject()
            delete updateChat._id
            const chatModel = new publicChatMongoModel(Object.assign({}, updateChat, { chatId: id }));
            await chatModel.save();
            // 更新item
            const updateItems = await itemMongoModel.find({
                chatId: id
            })
            for (let iterator of updateItems) {
                iterator = iterator.toObject()
                delete iterator._id
                const itemModel = new publicItemMongoModel(iterator);
                await itemModel.save();
            }
            // 更新logic
            const updateLogics = await logicMongoModel.find({
                chatId: id
            })
            for (let iterator of updateLogics) {
                iterator = iterator.toObject()
                delete iterator._id
                const logicModel = new publicLogicMongoModel(iterator);
                await logicModel.save();
            }
        }
        console.log("同步成功")
        return "同步成功"
    }

}

module.exports = new service();