const smsMongoModel = require('../../model/smsMongoModel');
const characterMongoModel = require('../../model/characterMongoModel');
const cartoonMongoModel = require('../../model/cartoonMongoModel');
const publicCartoonMongoModel = require('../../model/publicCartoonMongoModel');
const chatMongoModel = require('../../model/chatMongoModel');
const logicMongoModel = require('../../model/logicMongoModel');
const itemMongoModel = require('../../model/itemMongoModel');
const publicChatMongoModel = require('../../model/publicChatMongoModel');
const publicLogicMongoModel = require('../../model/publicLogicMongoModel');
const publicItemMongoModel = require('../../model/publicItemMongoModel');
const packageMongoModel = require('../../model/packageMongoModel');
const chapterMongoModel = require('../../model/chapterMongoModel');
const gameMongoModel = require('../../model/gameMongoModel');
const paintMongoModel = require('../../model/paintMongoModel');
const cosService = require('../cosService');
const cartoonService = require('../cartoonService');
const smsService = require('../smsService');
const chapterService = require('../chapterService');
const fs = require('fs');
const ftp = require('ftp');
const path = require('path');
const request = require('request');
const archiver = require('archiver');
const config = require('../../../config/config');
const FtpDeploy = require("ftp-deploy");
const axios = require("axios");
const crypto = require("crypto");
const packageAppService = require("./packageAppService")

// 工具service

const toolService = require("./toolService")

/**
 * 聊天，语音，场景等公共资源
 */
class service {
    /**
      * 整理资源包中的内容
      * @param {*} smsId 
      * @param {*} resourcePath 指定生成路径
      */
    async __getZipFiles(smsId, resourcePath) {
        const basePath = resourcePath ? resourcePath : path.resolve(__dirname, `../../../public/`);

        // 打包文件路径
        let zipFile = [];

        // 短信
        const sms = await smsMongoModel.findById(smsId);
        if (!sms) {
            return zipFile;
        }

        // 漫画
        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId: sms.get('cartoonId') });
        // 聊天背景图片
        if (cartoon.get('listBgImage')) {
            const filePath = path.resolve(basePath, `${toolService.__getAvatorName(cartoon.get('listBgImage'))}.png`);;
            await toolService.__downImg(filePath, cartoon.get('listBgImage'));
            zipFile.push(filePath);
        }
        // 发送按钮图片
        if (cartoon.get('contentSendBtnImage')) {
            const filePath = path.resolve(basePath, `${toolService.__getAvatorName(cartoon.get('contentSendBtnImage'))}.png`);
            await toolService.__downImg(filePath, cartoon.get('contentSendBtnImage'));
            zipFile.push(filePath);
        }

        // 群聊头像
        if (sms.get('type') === 'group' && sms.get('groupAvator')) {
            const avators = sms.get('groupAvator').split('/');
            const avator = avators[avators.length - 1];

            const filePath = await smsService.formatImg([avator], `${smsId}`, resourcePath);
            zipFile.push(filePath);
        }

        // 对话涉及的人物
        const characterIds = new Set(sms.get('characters'));

        // 对话包
        const chats = await publicChatMongoModel.find({
            smsId: smsId
        });

        // 漫画下章节
        const chapters = await chapterMongoModel.find({
            cartoonId: cartoon.id
        });

        // 章节中的对话id
        let chapterIds = [];
        chapters.forEach(chapter => {
            chapter.get('item').forEach(item => {
                if(item.chatId) {
                    chapterIds.push(item.chatId);
                }
            })
        });

        // 组装对话包
        for (let chat of chats) {
            let chatId = chat.get("chatId")

            // 排除章节中的对话
            if(chapterIds.indexOf(chatId) !== -1) {
                continue;
            }

            // 查找对话涉及人物
            const items = await publicItemMongoModel.find({
                chatId: chatId
            });

            for (let item of items) {
                if (item.get('roleId') !== "0" && item.get('roleId') !== 0) {
                    characterIds.add(item.get('roleId'))
                }

                // 图片、音频类消息
                if ((item.get('contentType') === 'image' || item.get('contentType') === 'audio') && item.get('content')) {
                    const imageName = toolService.__getAvatorName(item.get('content'));
                    const contentPath = path.resolve(basePath, `${imageName}.png`);
                    const stream = fs.createWriteStream(contentPath);
                    await new Promise(function (resolve, reject) {
                        request(item.get('content')).pipe(stream).on('close', function (err) {
                            if (err) {
                                reject(err);
                            }
                            resolve();
                        })
                    });
                    zipFile.push(contentPath);
                }
            }

            // 生成对话包json
            const json = await this.jsonByChat(chatId, null, 'chat');
            let fileName = chatId + '.json';

            // json生成文件
            const filePath = path.resolve(basePath, `${fileName}`);
            fs.writeFileSync(filePath, JSON.stringify(json));

            // 打包json文件
            zipFile.push(filePath);
        }

        // 处理头像图片
        const characters = await characterMongoModel.find({
            _id: {
                $in: Array.from(characterIds)
            }
        });

        // 下载头像图片,用id为名
        for (let character of characters) {
            const avators = character.get('avator').split('/');
            const avator = avators[avators.length - 1];

            const filePath = await smsService.formatImg([avator], `${character.id}`, resourcePath);
            // const filePath = path.resolve(__dirname,`../../../public/${character.id}.png`);
            // const stream = fs.createWriteStream(filePath);
            // await new Promise(function(resolve, reject){
            //     request(character.get('avator')).pipe(stream).on('close', function(err) {
            //         if(err) {
            //             reject(err);
            //         }
            //         resolve();
            //     })
            // });

            zipFile.push(filePath);
        }

        return zipFile;
    }

    /**
      * 对话包json
      * @param {*} params 
      */
    async jsonByChat(chatId, showUrl, type, avatorPath) {
        const chat = await publicChatMongoModel.findOne({ chatId });
        if (!chat) {
            // throw new Error('对话包不存在');
            return {}
        }

        const sms = await smsMongoModel.findById(chat.get('smsId'));

        // 漫画
        const cartoon = await publicCartoonMongoModel.findOne({ cartoonId: sms.get('cartoonId') });

        const logics = await publicLogicMongoModel.find({
            chatId: chatId
        });

        const logicMap = new Map();
        const logicByItemMap = new Map();
        logics.forEach(el => logicMap.set(el.id, el));
        logics.forEach(el => logicByItemMap.set(el.get('itemId'), el));

        const items = await publicItemMongoModel.find({
            chatId: chatId
        });

        // 数字id
        let numId = 1;
        let numIdMap = new Map();

        const itemItemMap = new Map();
        items.forEach(el => {
            itemItemMap.set(el.id, el);

            // 设置数字id
            if (el.get('options')) {
                // group类型生成option的id
                let optionIds = [];
                el.get('options').forEach(opEl => {
                    numIdMap.set(opEl.id, numId);
                    optionIds.push(numId);
                    numId++;
                })

                numIdMap.set(el.id, optionIds);
            } else {
                numIdMap.set(el.id, numId);
                numId++;
            }
        });

        let CvType;
        let resultIdIndex = 1;

        // 组装对话列表
        const messageList = [];
        for (let i = 0; i < items.length; i++) {
            if (i === 59) {
                console.log();
            }
            const item = items[i];
            const logic = logicByItemMap.get(item.id);

            let NeedClickShowNextMessage = true;
            if (type === 'chat' || (type !== 'chat' && i === 0)) {
                NeedClickShowNextMessage = false;
            }
            let catJson = {
                Type: sms.get('type'),
                MessageId: numIdMap.get(item.id),    // 消息id
                MessageInterval: 0.8,    // 消息出现的时间间隔，暂默认设置为0.8秒
                NeedClickShowNextMessage: NeedClickShowNextMessage,
            };

            // 本条消息说话的角色
            let character;
            if (item.get('roleId') && item.get('roleId') !== 0 && item.get('roleId') !== "0") {
                character = await characterMongoModel.findById(item.get('roleId'));
                catJson.RealName = character.get('realName');   // 角色名字（中文文字）
                catJson.RoleName = character.id;   // 角色名字（拼音）
                catJson.IsProtagonist = character.get('isProtagonist'); // 是否为主角

                // 下载头像图片
                if (avatorPath) {
                    const avatorName = toolService.__getAvatorName(character.get('avator'));
                    await smsService.formatImg([`${avatorName}.png`], character.id, avatorPath);
                }
            } else {
                catJson.RealName = "";
                catJson.RoleName = "";
                catJson.IsProtagonist = false;
            }

            // 对话气泡颜色
            if (type === 'chat') {
                let BubbleColor = '';
                if (cartoon.get('contentMessageBgColors')) {
                    if (character && character.get('isProtagonist')) {
                        BubbleColor = cartoon.get('contentMessageBgColors').length > 1 ? cartoon.get('contentMessageBgColors')[1] : cartoon.get('contentMessageBgColors')[0];
                    } else {
                        BubbleColor = cartoon.get('contentMessageBgColors')[0];
                    }
                }

                // 默认颜色
                if (!BubbleColor && character) {
                    BubbleColor = character.get('isProtagonist') ? '#FDE1FF' : '#FFFFFF';
                }
                catJson.BubbleColor = BubbleColor;
            }

            let previousMessage = '正在输入中。。。';
            if (character && character.get('isProtagonist')) {
                previousMessage = '';
            }

            // 心动值
            if (character && character.get('isProtagonist') && item.get('score')) {
                catJson.HeartBeatNum = item.get('score');
            }

            // 场景语音对话属性
            if (type === 'scene' || type === 'voice') {
                // 背景图片
                let backgroundName = "";
                if (chat.get('backgrounds')) {
                    for (let background of chat.get('backgrounds')) {
                        if (background.id === item.get('backgroundId')) {
                            backgroundName =  toolService.__getAvatorName(background.url);
                            break;
                        }
                    }
                }
                catJson.background = backgroundName;

                // 转场特效
                catJson.backgroundEffectId = "FadeAway";

                // 立绘图
                let npcImage = "";
                if (item.get('paintId') && item.get('paintId') !== 0 && item.get('paintId') !== "0") {
                    const paint = await paintMongoModel.findById(item.get('paintId'));
                    npcImage = toolService.__getAvatorName(paint._doc.bodyImage);
                }
                catJson.npcImage = npcImage;
            }

            // 上组消息id
            let parentIds = [];
            let parentRealIds = [];

            if (logic) {
                if (logic.get('prevIds').length > 0 && logic.get('prevIds')[0] != -1 && logic.get('prevIds').indexOf(null) == -1) {
                    logic.get('prevIds').forEach(el => {
                        if (logicMap.get(el)) {
                            const thisNumId = numIdMap.get(logicMap.get(el).get('itemId'));
                            if (thisNumId) {
                                if (Array.isArray(thisNumId)) {
                                    parentIds = parentIds.concat(thisNumId);
                                } else {
                                    parentIds.push(thisNumId);
                                }
                                parentRealIds.push(logicMap.get(el).get('itemId'));
                            }
                        }
                    });
                } else if ((logic.get('prevIds').length == 0 || logic.get('prevIds').indexOf(null) != -1) && i != 0) {
                    const parentItem = items[i - 1];
                    if (parentItem.get('type') === 'single') {
                        if (Array.isArray(numIdMap.get(parentItem.id))) {
                            parentIds = parentIds.concat(numIdMap.get(parentItem.id));
                        } else {
                            parentIds.push(numIdMap.get(parentItem.id));
                        }
                        parentRealIds = [parentItem.id];
                    } else {
                        for (let j = 0; j < parentItem.get('options').length; j++) {
                            if (logicByItemMap.get(parentItem.id) && logicByItemMap.get(parentItem.id).get('nextIds')[j] != -1) {
                                const thisNumId = numIdMap.get(parentItem.get('options')[j].id);
                                if (thisNumId) {
                                    if (Array.isArray(thisNumId)) {
                                        parentIds = parentIds.concat(thisNumId);
                                    } else {
                                        parentIds.push(thisNumId);
                                    }
                                    parentRealIds.push(parentItem.get('options')[j].id);
                                }
                            }
                        }
                    }
                }
            } else if (i != 0) {
                const parentItem = items[i - 1];
                parentRealIds.push(parentItem.id);
                if (Array.isArray(numIdMap.get(parentItem.id))) {
                    parentIds = parentIds.concat(numIdMap.get(parentItem.id));
                } else {
                    parentIds.push(numIdMap.get(parentItem.id));
                }
            }
            catJson.ParentMessageIds = parentIds;

            // 有心动值，增加被回复角色
            if (catJson.HeartBeatNum && parentRealIds.length > 0) {
                // item中设置增加心动值角色，没设置去父节点角色id
                let replyCharacterId;
                if (item.get('replyRoleId')) {
                    replyCharacterId = item.get('replyRoleId');
                } else {
                    const parentItem = itemItemMap.get(parentRealIds[0]);
                    replyCharacterId = parentItem.get('roleId')
                }

                const replyCharacter = await characterMongoModel.findById(replyCharacterId);
                catJson.ReplyRoleId = replyCharacter.id;     // 回应对象角色id
                catJson.ReplyRoleName = replyCharacter.get('realName');  // 回应对象角色的名字汉字
            }

            const nextItem = items[i + 1];
            if (item.get('type') === 'single') {
                // 消息类型
                if (item.get('contentType') === 'text') {
                    // 文字消息
                    if (type === 'chat') {
                        // 短信对话
                        catJson.MessageType = 0;
                        catJson.PreviousMessage = previousMessage;
                    } else if (type === 'scene') {
                        // 场景对话，role=0旁白
                        catJson.MessageType = item.get('roleId') === 0 || item.get('roleId') === "0" ? 2 : 0;;
                    }
                    catJson.Message = item.get('content').replace(new RegExp(/(\\n)/g), '').replace(new RegExp(/(\n)/g), '');
                    // 如果有音频，添加音频
                    if (item.get("voice")) {
                        catJson.CvFileName = toolService.__getAvatorName(item.get('voice')) + ".ogg"
                        CvType = 1;
                    }
                } else if (item.get('contentType') === 'image') {
                    // 图片消息
                    catJson.MessageType = 1;
                    if (showUrl === 'true') {
                        catJson.MessageImagePath = item.get('content');
                    } else {
                        catJson.MessageImagePath = toolService.__getAvatorName(item.get('content'));
                    }
                } else if (item.get('contentType') === 'audio') {
                    // 音频消息
                    catJson.MessageType = 2;
                    if (showUrl === 'true') {
                        catJson.VoicePath = item.get('content');
                    } else {
                        catJson.VoicePath = toolService.__getAvatorName(item.get('content'));
                    }
                }

                // 场景对话，最后一条显示resultId
                let resultId;
                if (type === 'scene' || type === 'voice') {
                    resultId = chat.get('chatTitleName') + "_" + resultIdIndex;
                }

                if (logic) {
                    toolService.__formatNext(logic.get('nextIds')[0], nextItem, catJson, logicMap, itemItemMap, numIdMap, resultId);
                } else if (i != items.length - 1) {
                    // 最后一条不设置nextMessageId
                    toolService.__formatNext(nextItem.id, nextItem, catJson, logicMap, itemItemMap, numIdMap, resultId);
                } else {
                    // 最后一条设置resultId
                    if (resultId) {
                        catJson.resultId = resultId
                    }
                }

                if (catJson.resultId) {
                    resultIdIndex++;
                }

                messageList.push(catJson);
            } else {
                for (let j = 0; j < item.get('options').length; j++) {
                    let option = item.get('options')[j];
                    let tmpJson = JSON.parse(JSON.stringify(catJson));
                    tmpJson.MessageId = numIdMap.get(option.id);
                    tmpJson.MessageType = 0;
                    tmpJson.Message = option.content;
                    tmpJson.PreviousMessage = previousMessage;

                    if (option.score) {
                        tmpJson.HeartBeatNum = option.score;

                        if (parentRealIds.length > 0) {
                            // item中设置增加心动值角色，没设置去父节点角色id
                            let replyCharacterId;
                            if (option.replyRoleId) {
                                replyCharacterId = option.replyRoleId;
                            } else {
                                const parentItem = itemItemMap.get(parentRealIds[0]);
                                replyCharacterId = parentItem.get('roleId')
                            }
                            const replyCharacter = await characterMongoModel.findById(replyCharacterId);
                            tmpJson.ReplyRoleId = replyCharacter.id;     // 回应对象角色id
                            tmpJson.ReplyRoleName = replyCharacter.get('realName');  // 回应对象角色的名字汉字
                        }
                    }

                    // 场景对话，最后一条显示resultId
                    let resultId;
                    if (type === 'scene' || type === 'voice') {
                        resultId = chat.get('chatTitleName') + "_" + resultIdIndex;
                    }

                    if (logic) {
                        toolService.__formatNext(logic.get('nextIds')[j], nextItem, tmpJson, logicMap, itemItemMap, numIdMap, resultId);
                    } else if (i != items.length - 1) {
                        // 最后一条不设置nextMessageId
                        toolService.__formatNext(nextItem.id, nextItem, tmpJson, logicMap, itemItemMap, numIdMap, resultId);
                    } else {
                        // 最后一条设置resultId
                        if (resultId) {
                            catJson.resultId = resultId
                        }
                    }

                    if (tmpJson.resultId) {
                        resultIdIndex++;
                    }

                    messageList.push(tmpJson);
                }
            }
        }

        // 组装json
        let returnJson;

        if (type === 'voice') {
            const defCharacter = await characterMongoModel.findById(sms.get('characters')[0]);
            returnJson = {
                NpcId: defCharacter.id,
                TopicTitle: defCharacter.get("realName"),
                TopicId: chatId,
                type:chat.get("type"),
                text:chat.get("text"),
                status:chat.get("status")
            }
        } else {
            const defCharacter = await characterMongoModel.findById(sms.get('characters')[0]);
            returnJson = {
                ChatTitleName: chat.get('chatTitleName'),
                ChatId: chat.chatId,
                TopicName: defCharacter.get("realName"),
                TopicId: sms.id
            }
        }

        if (CvType) {
            returnJson.CvType = CvType;
        }

        // 场景对话
        if (type === 'scene') {
            returnJson.backDescribe = "";

            // 默认背景图
            let defaultBackground = "";
            if (chat.get('backgrounds') && chat.get('backgrounds').length > 0) {
                defaultBackground = toolService.__getAvatorName(chat.get('backgrounds')[0].url);
            }
            returnJson.DefaultBackground = defaultBackground;
        }

        if (type === 'voice') {
            returnJson.TopicList = messageList;
        } else {
            returnJson.MessageList = messageList;
        }

        return returnJson;
    }

       /**
     * 整理聊天包json
     * @param {*} smsId 
     */
    async __getSmsJson(smsId) {
        // 短信
        const sms = await smsMongoModel.findById(smsId);
        if (!sms) {
            throw new Error('短信不存在吗');
        }

        // 漫画
        const cartoon = await publicCartoonMongoModel.findOne({cartoonId:sms.get('cartoonId')});
       const characterId=sms.get('characters')[0]
        const chapter = await characterMongoModel.findById(characterId);
           
        let smsJson = {
            npc_id: sms.id,
            avatar: '',
            npc_name: sms.get('type') === 'group' ? sms.get("name") : chapter.get("realName"),
            isGroupChat: sms.get('type') === 'group' ? true : false,
            bgTexture: cartoon.get('listBgImage') ? toolService.__getAvatorName(cartoon.get('listBgImage')) : 'defListBgImage.jpg',  // 聊天背景
            topGuidColor: cartoon.get('listNavBgColor') ? cartoon.get('listNavBgColor') : '#9FB6FF',               // 导航颜色
            enterTexture: cartoon.get('contentSendBtnImage') ? toolService.__getAvatorName(cartoon.get('contentSendBtnImage')) : 'defContentSendBtnImage',     // 发送按钮图片
            optionBg: cartoon.get('contentOptionBgImage') ? toolService.__getAvatorName(cartoon.get('contentOptionBgImage')) : '',     // 按钮背景图片
            topics: [],
            extra: '',
            isRed: true
        }; 

        // 短信角色
        if (sms.get('type') === 'group') {
            if (sms.get('groupAvator')) {
                // 群聊生成头像
                const groupAvator = toolService.__getAvatorName(sms.get('groupAvator'));
                smsJson.avatar = groupAvator;
            }
        } else {
            // 单聊头像
            smsJson.avatar = sms.get('characters')[0];
        }

        // 对话包
        const chats = await publicChatMongoModel.find({
            smsId: smsId,
            deleted: false
        });

        // 漫画下章节
        const chapters = await chapterMongoModel.find({
            cartoonId: cartoon.id
        });

        // 章节中的对话id
        let chapterIds = [];
        chapters.forEach(chapter => {
            chapter.get('item').forEach(item => {
                if(item.chatId) {
                    chapterIds.push(item.chatId);
                }
            })
        });

        // 组装对话包
        for (let chat of chats) {
            // 排除章节中的对话
            if(chapterIds.indexOf(chat.chatId) !== -1) {
                continue;
            }

            // 回写url
            smsJson.topics.push({
                topic_id: chat.chatId,
                topic_name: chat.get('chatTitleName'),
                url: chat.chatId,
                type:chat.get("type"),
                text:chat.get("text"),
                status:chat.get("status")
            });
        }

        return smsJson;
    }
}

module.exports = new service();


