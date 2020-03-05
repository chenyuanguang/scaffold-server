const cartoonMongoModel = require('../model/cartoonMongoModel');
const publicCartoonMongoModel = require('../model/publicCartoonMongoModel');
const packageMongoModel = require('../model/packageMongoModel');
const chapterMongoModel = require('../model/chapterMongoModel');
const dressMongoModel = require('../model/dressMongoModel');
const gameMongoModel = require('../model/gameMongoModel');
const characterMongoModel = require('../model/characterMongoModel');
const paintMongoModel = require('../model/paintMongoModel');
const smsMongoModel = require('../model/smsMongoModel');
const chatMongoModel = require('../model/chatMongoModel');
const itemMongoModel = require('../model/itemMongoModel');
const logicMongoModel = require('../model/logicMongoModel');
const publicChatMongoModel = require('../model/publicChatMongoModel');
const publicItemMongoModel = require('../model/publicItemMongoModel');
const publicLogicMongoModel = require('../model/publicLogicMongoModel');
// const publicCartoonMongoModel = require('../model/publicCartoonMongoModel');
// const publicCartoonMongoModel = require('../model/publicCartoonMongoModel');
const permissionMongoModel = require('../model/permissionMongoModel');
const mongoose = require('../../config/mongo');
const config = require('../../config/config');
const constant = require('../common/constant');

/**
 * 漫画
 */
class service {
    /**
     * 真实删除
     * @param {*} id 
     */
    async delReal(id) {
        //删除漫画
        await cartoonMongoModel.remove({
            _id: id,
        })
        //删除发布漫画
        await publicCartoonMongoModel.remove({
            cartoonId: id,
        })
        
         //删除打包信息
         await packageMongoModel.remove({
            objectId: id,
        })
        //删除章节
        await chapterMongoModel.remove({
            cartoonId: id,
        })
        //删除服装
        await dressMongoModel.remove({
            cartoonId: id,
        })
        
         //删除游戏
         await gameMongoModel.remove({
            cartoonId: id,
        })

        //删除人物前删除立绘
        let characters=await characterMongoModel.find({
            cartoonId: id,
        })
        for (const character of characters) {
            //删除人物立绘
            await paintMongoModel.remove({
                characterId:character.get("id")
            })
        }
        //删除人物
        await characterMongoModel.remove({
            cartoonId: id,
        })

        // 删除对话包
        let sms=await smsMongoModel.find({
            cartoonId: id,
        })
        for (const item of sms) {
            let chats=await chatMongoModel.find({
                smsId: item.get("id"),
            })
            for (const jtem of chats) {
                await itemMongoModel.remove({
                    chatId:jtem.get("id")
                })
                await logicMongoModel.remove({
                    chatId:jtem.get("id")
                })
                await publicItemMongoModel.remove({
                    chatId:jtem.get("id")
                })
                await publicItemMongoModel.remove({
                    chatId:jtem.get("id")
                })

            }
            await chatMongoModel.remove({
                smsId: item.get("id")
            })
            await publicChatMongoModel.remove({
                smsId: item.get("id")
            })
        }
        await smsMongoModel.remove({
            cartoonId: id,
        })
    }
    /**
     * 创建
     * @param {*} params 
     */
    async create(loginUserId, params) {
        
        loginUserId="1" //默认写死
        const now = new Date();
        const id = mongoose.Types.ObjectId();

        // 生成默认包名
        params.packageName = await this.packageName(now);

        // 默认版本号
        // 章节素材版本号
        params.chapterResourceVersion = 1;

        params._id = id;
        params.createdAt = now;
        params.createdBy = loginUserId;
        params.deleted = false;
        const cartoonModel = new cartoonMongoModel(params);
        await cartoonModel.save();

        return cartoonModel;
    }

    /**
     * 默认包名
     */
    async packageName(now) {
        const lastCartoon = await cartoonMongoModel.findOne({
            deleted: false
        }, null, { sort: { createdAt: -1 } });

        const todayStr = String(new Date().getFullYear()).substring(2)
            + (now.getMonth() + 1 < 10 ? '0' + (now.getMonth() + 1) : (now.getMonth() + 1)) + ''
            + (now.getDate() < 10 ? '0' + now.getDate() : now.getDate())

        let num = Number(lastCartoon.get('packageName').substring(8 + constant.PACKAGE_NAME.length)) + Math.floor(Math.random() * 5 + 1);

        return constant.PACKAGE_NAME + todayStr + (num < 10 ? '00' + num : num < 100 ? '0' + num : num);
    }

    /**
     * 查询详情
     * @param {*} id 
     */
    async find(loginUserId, id,packageName) {
        loginUserId="1"//默认写死
        let cartoon
        if(id){
            cartoon=await cartoonMongoModel.findById(id);
        }else{
            cartoon=await cartoonMongoModel.findOne({
                packageName
            });
        }
    

        if (!cartoon || cartoon.get('deleted') || cartoon.get('createdBy') != loginUserId) {
            throw new Error('漫画不存在');
        }
        // 打包状态
        const packageModel = await packageMongoModel.findOne({
            objectId: cartoon.id
        }, null, { sort: { createdAt: -1 } });

        let packageStatus = 0;
        if (packageModel) {
            packageStatus = packageModel.get('status')

        }

        cartoon._doc.packageStatus = packageStatus;

        // 获取历史打包版本
        let packageApk = []
        let types = ["ios", "android"]
        for (const item of types) {
            const packageModelHistory = await packageMongoModel.findOne({
                objectId: cartoon.id,
                type: item,
                url: {
                    $exists: true
                }
            }, null, { sort: { createdAt: -1 } });
            if (packageModelHistory) {
                let url = packageModelHistory.get("url")
                if (url) {
                    packageApk.push(packageModelHistory)
                }
            }
        }
        //如果没有打包成功的历史package版本，返回version为“”，无packageApk字段
        if (packageApk.length === 0) {
            cartoon._doc.version = ""
        } else {
            cartoon._doc.packageApk = packageApk
        }

        return cartoon;
    }

    /**
     * 列表查询
     */
    async query(token, params) {
        let loginUserId=token.id
        params.deleted = false;
        params.createdBy = "1";//默认写死
        const permissions=await permissionMongoModel.findOne({user_id:loginUserId})
        if(token.permission!==0){
            params._id={
                $in:permissions?permissions.get("cartoons").map((item)=>{return item.cartoonId}):[]
            }
        }
       
        const cartoons = await cartoonMongoModel.find(params);
       
        for (let cartoon of cartoons) {
            // 打包状态
            const packageModel = await packageMongoModel.findOne({
                objectId: cartoon.id
            }, null, { sort: { createdAt: -1 } });

            let packageStatus = 0;
            if (packageModel) {
                packageStatus = packageModel.get('status')

            }

            cartoon._doc.packageStatus = packageStatus;

            // 获取历史打包版本
            let packageApk = []
            let types = ["ios", "android"]
            for (const item of types) {
                const packageModelHistory = await packageMongoModel.findOne({
                    objectId: cartoon.id,
                    type: item,
                    url: {
                        $exists: true
                    }
                }, null, { sort: { createdAt: -1 } });
                if (packageModelHistory) {
                    let url = packageModelHistory.get("url")
                    if (url) {
                        packageApk.push(packageModelHistory)
                    }
                }
            }
            //如果没有打包成功的历史package版本，返回version为“”，无packageApk字段
            if (packageApk.length === 0) {
                cartoon._doc.version = ""
            } else {
                cartoon._doc.packageApk = packageApk
            }
        }
        return cartoons;
    }

    /**
     * 更新
     */
    async update(loginUserId, id, params) {
        const cartoon = await cartoonMongoModel.findById(id);
        loginUserId="1" //默认写死
        if (cartoon.get('createdBy') != loginUserId) {
            throw new Error('无权修改');
        }

        params.updatedAt = new Date();
        delete params._id;
        delete params.deleted;
        delete params.createdBy;
        await cartoonMongoModel.update({
            _id: id
        }, params);
    }

    /**
     * 删除
     * @param {*} id 
     */
    async del(loginUserId, id) {
        loginUserId="1"//默认写死
        await cartoonMongoModel.update({
            _id: id,
            createdBy: loginUserId
        }, {
            deleted: true,
            deletedAt: new Date()
        });
        
    }
    


}

module.exports = new service();