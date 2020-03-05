const chapterMongoModel = require('../model/chapterMongoModel');
const publicCartoonMongoModel = require('../model/publicCartoonMongoModel');
const gameMongoModel = require('../model/gameMongoModel');
const chatMongoModel = require('../model/chatMongoModel');
const mongoose = require('../../config/mongo');
const config = require('../../config/config');
const puppeteer = require('puppeteer');

/**
 * 章节
 */
class service {
    
    /**
     * 创建
     * @param {*} params 
     */
    async create(params) {
        const now = new Date();

        if(params.item) {
            params.item.forEach(el => {
                el.id = mongoose.Types.ObjectId().toHexString();
            });
        }

        params.version = 1;
        params.createdAt = now;
        const chapterModel = new chapterMongoModel(params);
        await chapterModel.save();

        return chapterModel;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const chapter = await chapterMongoModel.findById(id);
        if(!chapter) {
            throw new Error('章节不存在');
        }
        
        return chapter;
    }

    /**
     * 列表查询
     */
    async query(params) {
        const chapters = await chapterMongoModel.find(params);

        return chapters;
    }

    /**
     * 更新
     */
    async update(id, params) {
        if(params.item) {
            params.item.forEach(el => {
                if(!el.id) {
                    el.id = mongoose.Types.ObjectId().toHexString();
                }
            });
        }

        // 每次编辑，版本+1
        if(Object.keys(params).length > 0) {
            const chapteer = await chapterMongoModel.findById(id);
            params.version = chapteer.get('version')?chapteer.get('version')+1:1;
        }

        params.updatedAt = new Date();
        await chapterMongoModel.update({
            _id: id
        }, params);
    }

    /**
     * 删除
     * @param {*} id 
     */
    async del(id) {
        await chapterMongoModel.deleteOne({
            id: id
        });
    }

    /**
     * 条漫分块截取
     * @param {*} imgUrl 
     */
    async formatChapter(imgUrl, imgPath, position, height) {
        const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();
        await page.setViewport({
            width: 750,
            height: 1334,
            deviceScaleFactor: 1,
        });
        await page.goto(`http://localhost:${config.port}/api/v1/view/chapter?chapter=${imgUrl}&position=${position}&height=${height}`);

        await page.screenshot({path: imgPath, omitBackground: true});
        await browser.close();
    }

    /**
     * app端拉去章节更新
     * @param {*} id 
     */
    async pull(cartoonId) {
        const chapters = await chapterMongoModel.find({
            cartoonId: cartoonId
        });

        const chapterJson = [];
        for(let i=0; i<chapters.length; i++) {
            const chapter = chapters[i];
            const name = `第${this.__sectionToChinese((i+1))}章：${chapter.get('name')}`
            chapterJson.push({
                "Id": `${(i+1)}`,
                "Name": name,
                "Background": chapter.get('backgroud')?chapter.get('backgroud'):`item_bg_0${(i+1)}`,
                "StoryUrl": `${config.host}/api/v1/chapter/pull/resource/${chapter.id}`
            });
        }

        return chapterJson;
    }

    /**
     * app端拉取章节sz资源文件
     * @param {*} chapterId 
     */
    async pullResource(chapterId) {
        const chapter = await chapterMongoModel.findById(chapterId);

        const chapters = await chapterMongoModel.find({
            cartoonId: chapter.get('cartoonId')
        });

        let chapterIndex = 0;
        for(let i=0; i<chapters.length; i++) {
            chapterIndex = i+1;
            if(chapters[i].id === chapter.id) {
                break;
            }
        }

        const cartoon = await publicCartoonMongoModel.findOne({cartoonId:chapter.get('cartoonId')});

        let result = [];
        for(let i=0; i<chapter.get('item').length; i++) {
            result.push({
                name: `part_${(i+1)}`,
                version: cartoon.get('chapter_Version'),
                layoutType: 0,  // 0条漫 1ppt
                category: 0,     // 0漫画内容 1互动内容
                url: `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${cartoon.get('packageName')}.resource.chapter.section_${chapterIndex}.part_${(i+1)}.sz`
            });

            // 有互动，增加互动
            if(chapter.get('item')[i].interactionId) {
                const game = await gameMongoModel.findById(chapter.get('item')[i].interactionId);
                
                let interact;
                switch(game.get('type')) {
                    case 'find':
                        interact = 1;
                        break;
                    case 'jigsaw':
                        interact = 2;
                        break;
                    case 'card':
                        interact = 3;
                        break;
                    case 'mix':
                        interact = 4;
                        break;
                }
                
                // 互动游戏
                result.push({
                    interact: interact,
                    interactid: game.id,
                    name: game.get('name'),
                    version: game.get('version'),
                    layoutType: 0,  // 0条漫 1ppt
                    category: 1,     // 0漫画内容 1互动内容
                    url: `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${cartoon.get('packageName')}.resource.game.${game.id}.sz`
                });
            }

            // 电话
            if(chapter.get('item')[i]._doc.voiceChatId) {
                const chat = await chatMongoModel.findById(chapter.get('item')[i]._doc.voiceChatId);
                result.push({
                    interact: 5,
                    topic_id: chat.id,
                    name: chat.get('chatTitleName'),
                    version: chat.get('version')?chat.get('version'):1,
                    layoutType: 0,  // 0条漫 1ppt
                    category: 1,     // 0漫画内容 1互动内容
                    url: `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${cartoon.get('packageName')}.resource.voice.${chat.id}.sz`
                })
            }

            // 聊天
            if(chapter.get('item')[i].chatId) {
                const chat = await chatMongoModel.findById(chapter.get('item')[i].chatId);
                result.push({
                    interact: 0,
                    topic_id: chat.id,
                    name: chat.get('chatTitleName'),
                    version: chat.get('version')?chat.get('version'):1,
                    layoutType: 0,  // 0条漫 1ppt
                    category: 1,     // 0漫画内容 1互动内容
                    url: `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${cartoon.get('packageName')}.resource.chat.${chat.id}.sz`
                })
            }

            // 场景
            if(chapter.get('item')[i]._doc.sceneChatId) {
                const chat = await chatMongoModel.findById(chapter.get('item')[i]._doc.sceneChatId);
                result.push({
                    interact: 6,
                    topic_id: chat.id,
                    name: chat.get('chatTitleName'),
                    version: chat.get('version')?chat.get('version'):1,
                    layoutType: 0,  // 0条漫 1ppt
                    category: 1,     // 0漫画内容 1互动内容
                    url: `https://${config.cos_bucket}.cos.${config.cos_region}.myqcloud.com/animefactory/${cartoon.get('packageName')}.resource.scene.${chat.id}.sz`
                })
            }
        }

        return result;
    }

    /**
     * 数字转汉字
     * @param {number} section 
     */
    __sectionToChinese(section){
     var chnNumChar = ["零","一","二","三","四","五","六","七","八","九"];
     var chnUnitChar = ["","十","百","千","万","亿","万亿","亿亿"];
     var strIns = '', chnStr = '';
     var unitPos = 0;
     var zero = true;
     while(section > 0){
         var v = section % 10;
         if(v === 0){
              if(!zero){
                   zero = true;
                   chnStr = chnNumChar[v] + chnStr;
              }
         }else{
               zero = false;
               strIns = chnNumChar[v];
               strIns += chnUnitChar[unitPos];
               chnStr = strIns + chnStr;
         }
         unitPos++;
         section = Math.floor(section / 10);
      }
      return chnStr;
    }

}

module.exports = new service();