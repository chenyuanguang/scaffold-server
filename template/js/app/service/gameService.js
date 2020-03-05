const gameMongoModel = require('../model/gameMongoModel');
const chapterMongoModel = require('../model/chapterMongoModel');
const publicCartoonMongoModel = require('../model/publicCartoonMongoModel');
const smsMongoModel = require('../model/smsMongoModel');
const chatMongoModel = require('../model/chatMongoModel');
const config = require('../../config/config');

/**
 * 章节
 */
class service {
    
    /**
     * 创建
     * @param {*} params 
     */
    async create(params) {
        params.version = 1;
        params.isPackage = false;
        params.createdAt = new Date();
        const gameModel = new gameMongoModel(params);
        await gameModel.save();

        return gameModel;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const game = await gameMongoModel.findById(id);
        if(!game) {
            throw new Error('互动游戏不存在');
        }

        // 格式化章节
        await this.__format([game]);

        return game;
    }

    /**
     * 列表查询
     */
    async query(params) {
        const games = await gameMongoModel.find(params);

        // 格式化章节
        await this.__format(games);

        return games;
    }

    /**
     * 设置章节
     * @param {arrya} games 
     */
    async __format(games) {
        for(let game of games) {
            // 设置章节序号
            if(game.get('chapterId')) {
                // 章节
                const chapters = await chapterMongoModel.find({
                    cartoonId: game.get('cartoonId')
                });

                // 设置章
                for(let i=0; i<chapters.length; i++) {
                    const chapter = chapters[i];
                    if(chapter.id === game.get('chapterId')) {
                        game._doc.chapterIndex = i + 1;

                        // 设置节
                        if(game.get('chapterItemId')) {
                            for(let j=0;j<chapter.get('item').length; j++) {
                                const item = chapter.get('item')[j];
                                if(item.id === game.get('chapterItemId')) {
                                    game._doc.chapterItemIndex = j + 1;
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    /**
     * 更新
     */
    async update(id, params) {
        // 每次编辑，版本+1
        if(Object.keys(params).length > 0) {
            const game = await gameMongoModel.findById(id);
            params.version = game.get('version')?game.get('version')+1:1;
        }

        params.updatedAt = new Date();
        await gameMongoModel.update({
            _id: id
        }, params);
    }

    /**
     * 删除
     * @param {*} id 
     */
    async del(id) {
        await gameMongoModel.deleteOne({
            _id: id
        });
    }

    /**
     * app端拉游戏更新
     * @param {int} cartoonId 
     */
    async pull(id) {
        const cartoon = await publicCartoonMongoModel.findOne({
            packageName: id
        });

        const games = await gameMongoModel.find({
            cartoonId: cartoon.cartoonId
        });

        const result = [];

        // 互动游戏
        for(let game of games) {
            // 未打包的不返回
            if(game.get('isPackage') !== true) {
                continue;
            }

            let interactType;
            switch(game.get('type')) {
                case 'find':
                    interactType = 1;
                    break;
                case 'jigsaw':
                    interactType = 2;
                    break;
                case 'card':
                    interactType = 3;
                    break;
                case 'mix':
                    interactType = 4;
                    break;
            }
            result.push({
                interactType: interactType,
                interactId: game.id,
                version: game.get('version')?game.get('version'):1,
                resourceUrl: `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${cartoon.get('packageName')}.resource.game.${game.id}.sz`
            });
        }

        // 聊天内容
        const smses = await smsMongoModel.find({
            cartoonId: cartoon.cartoonId
        });



        let isChat = false;
        let isScene = false;
        let isVoice = false;
        for(let sms of smses) {
            const chats = await chatMongoModel.find({
                smsId: sms.id
            });

            for(let chat of chats) {
                // 聊天
                if(!isChat && (sms.get('type') === 'single' || sms.get('type') === 'group')) {
                    isChat = true;
                    result.push({
                        interactType: 0,
                        interactId: chat.id,
                        version: chat.get('version')?chat.get('version'):1,
                        resourceUrl: `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${cartoon.get('packageName')}.resource.chat.${chat.id}.sz`
                    });
                }

                // 场景
                if(!isScene && sms.get('type') === 'scene') {
                    isScene = true;
                    result.push({
                        interactType: 6,
                        interactId: chat.id,
                        version: chat.get('version')?chat.get('version'):1,
                        resourceUrl: `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${cartoon.get('packageName')}.resource.scene.${chat.id}.sz`
                    });
                }
                
                if(sms.get('type') === 'voiceSingle') {
                    isVoice = true;
                }
            }
        }

        // 语音对话
        if(isVoice) {
            result.push({
                interactType: 5,
                interactId: cartoon.cartoonId,
                version: cartoon.get('voice_Version')?cartoon.get('voice_Version'):1,
                resourceUrl: `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${cartoon.get('packageName')}.resource.voice.${cartoon.cartoonId}.sz`
            });
        }

        return result;
    }

}

module.exports = new service();