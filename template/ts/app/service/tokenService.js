require('date-utils');
const uuid = require('../common/uuid');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const tokenMongoModel=require("../model/tokenMongoModel")
const userService = require('../service/userService');
const unionCmoa = require('../common/union/cmOa');


class tokenService {

    /**
     * 生成token
     * @param {string} user_id 
     * @param {json} params 
     */
    async makeToken(user_id, params) {
        const login_time = new Date();

        let token = await jwt.sign(params,
            new Buffer(config.private_key, 'base64').toString(),
            { expiresIn: config.token_active_time });

        // 异步清理过期token
        this.__delOverdue();

        // token入库
        const base64Token = new Buffer(token).toString('base64');
        const tokenCur=await tokenMongoModel.findOne({user_id:user_id})
        if(tokenCur){
            await tokenMongoModel.update({user_id:user_id},{
                token: base64Token,
                created_time: login_time,
                active_time: new Date().addSeconds(config.token_active_time)
            })
        }else{
            const tokenAdd=new tokenMongoModel({
                token: base64Token,
                user_id: user_id,
                created_time: login_time,
                active_time: new Date().addSeconds(config.token_active_time)
            })
            tokenAdd.save()
        }
        

        return base64Token;
    }

    /**
     * 删除过期token
     */
    async __delOverdue() {
        try {
            await tokenMongoModel.deleteMany({
                    active_time: {
                        $lt: new Date()
                    }
                });
        } catch (e) { }
    }

    /**
     * 三方登录回调
     * @param {json} params 
     * @param {string} defProjectId 登录用户projectid
     */
    async unionCallback(params) {
        // 三方用户
        let addUser = {};

        if (params.platform == 'cmoa') {
            let user={"username":"陈元广","uid":"chenyuanguang@cmcm.com","userno":"00010833","sex":"","sybdeptid":"","onedeptid":"1001A2100000000009T5","twodeptid":"1001A2100000000009TX"}

            if(process.env.NODE_ENV==="test"||process.env.NODE_ENV==="pro"){
                user = await unionCmoa.getUserInfo(params.sid);
            }
            
            addUser.mail = user.uid;
            addUser.is_mail_verified = true;
            addUser.username = user.uid;
            addUser.name = user.username;
            addUser.nickname = user.username;
            addUser.union_id = user.uid;
            addUser.permission=1    //权限
            addUser.initialed=false //是否开通
            addUser.disabled=true //是否禁用
            addUser.platform="cmoa"
            // addUser.cartoons=[]  //cartoonId
        } else {
            throw new Error('平台类型错误');
        }
        
        addUser.user_id=uuid()
        addUser.is_deleted = false;
        addUser.created_time = new Date();
        addUser.update_time = new Date();
        // 存储用户
        const dbUserInfo = await userService.create(null, addUser);

        return await this.makeToken(dbUserInfo.user_id, {
            id: dbUserInfo.user_id,
            username: dbUserInfo.username,
            nickname: dbUserInfo.nickname,
            head_url: dbUserInfo.head_url,
            mail: dbUserInfo.mail,
            is_mail_verified: dbUserInfo.is_mail_verified,
            permission:dbUserInfo.permission
        });
    }
}

module.exports = new tokenService();