const smsMongoModel = require('../model/smsMongoModel');
const chatMongoModel = require('../model/chatMongoModel');
const itemMongoModel = require('../model/itemMongoModel');
const publicChatMongoModel=require("../model/publicChatMongoModel")
const publicItemMongoModel=require("../model/publicItemMongoModel")
const publicLogicMongoModel=require("../model/publicLogicMongoModel")
const characterMongoModel = require('../model/characterMongoModel');
const cosService = require('./cosService');
const mongoose = require('../../config/mongo');
const config = require('../../config/config');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * 短信
 */
class service {
    
    /**
     * 创建
     * @param {*} params 
     */
    async create(params) {
        const id = mongoose.Types.ObjectId();

        // 群聊处理头像
        if(params.type === 'group') {
            params.groupAvator = await this.__makeGroupAvator(params.characters, id);
        }

        params._id = id;
        params.createdAt = new Date();
        params.deleted = false;
        const smsModel = new smsMongoModel(params);
        await smsModel.save();

        return smsModel;
    }

    /**
     * 创建群组头像
     * @param {array} characters 角色id
     * @param {*} newAvatorName 新头像名称
     */
    async __makeGroupAvator(characterIds, newAvatorName) {
        const characters = await characterMongoModel.find({
            _id: {
                $in: characterIds
            }
        });

        if(characters.length == 0) {
            return '';
        }

        const characterAvators = [];
        characters.forEach(el => { 
            const avator = el.get('avator').split('/');
            characterAvators.push(avator[avator.length-1]);
        });

        // 拼接头像
        const groupAvator = await this.formatImg(characterAvators, newAvatorName);

        // 头像上传cos
        const reader = fs.createReadStream(groupAvator);
        const url = await cosService.upload(`${newAvatorName}.png`, `${newAvatorName}.png`, 'image/png', reader);

        // 删除本地头像
        fs.unlinkSync(groupAvator);

        return url;
    }

    /**
     * 格式化圆角头像
     * @param {array} characterAvators 头像名
     * @param {string} newAvatorName   新头像名
     * @param {string} imgPath   保存路径
     */
    async formatImg(characterAvators, newAvatorName, imgPath) {
        const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const page = await browser.newPage();
        await page.setViewport({
            width: 144,
            height: 144,
            deviceScaleFactor: 1,
        });
        await page.goto(`http://localhost:${config.port}/api/v1/view/avator?avators=${characterAvators.join(',')}`);

        const basePath = imgPath?imgPath:path.resolve(__dirname,`../../public/`);
        const avator = path.resolve(basePath,`${newAvatorName}.png`);
        await page.screenshot({path: avator, omitBackground: true});
        await browser.close();

        return avator;
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(id) {
        const sms = await smsMongoModel.findById(id);
        if(!sms || sms.get('deleted')) {
            throw new Error('短信不存在');
        }
        return sms;
    }

    /**
     * 列表查询
     */
    async query(params) {
        params.deleted = false;
        const sms = await smsMongoModel.find(params);

        // 短信下对话包
        for(let smsObj of sms) {
            const chats = await chatMongoModel.find({
                smsId: smsObj.id,
                deleted: false
            });
            //发布过的chat
            const publicChats = await publicChatMongoModel.find({
                smsId: smsObj.id,
                deleted: false
            });

            // 回填对话包第一条人物头像
            try {
                for(let chat of chats) {
                    // 对话包下item
                    const item = await itemMongoModel.findOne({
                        chatId: chat.id
                    });

                    // 第一条对话的人物信息
                    // const character = await characterMongoModel.findById(item.get('roleId'));

                    // chat._doc.avator = character.get('avator');
                    chat._doc.item = item;

                    // 更新text(已发布的是旧的信息)

                    let target=publicChats.find((jtem,index)=>{
                        return jtem.get("chatId")===chat.get("id")
                    })

                    if(target){
                        chat._doc.text=target.get("text")
                    }else{
                        chat._doc.text=""
                    }
                }
            } catch(e) {
            }

            smsObj._doc.charts = chats;
        }

        return sms;
    }

    /**
     * 更新
     */
    async update(id, params) {
        const sms = await smsMongoModel.findById(id);

        // 修改群聊头像图片
        if(sms.get('type') === 'group' && params.characters) {
            const dbCharacters = sms.get('characters').slice(0,4);
            const upChatacters = params.characters.slice(0,4);

            // 前4个头像发生变化，修改头像图片
            if(dbCharacters.length != upChatacters.length || dbCharacters.sort().join() != upChatacters.sort().join()) {
                params.groupAvator = await this.__makeGroupAvator(upChatacters, id);
            }
        }

        delete params._id;
        delete params.deleted;
        await smsMongoModel.update({
            _id: id
        }, params);
    }

    /**
     * 删除
     * @param {*} id 
     */
    async del(id) {
        await smsMongoModel.update({
            _id: id
        }, {
            deleted: true,
            deletedAt: new Date()
        });
    }
    


}

module.exports = new service();