/*
 * @Author: your name
 * @Date: 2020-01-03 14:52:44
 * @LastEditTime: 2020-01-07 18:37:00
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/common/union/wx.js
 */
const axios = require('axios');
const crypto = require('crypto');
const config = require('../../../config/config');

/**
 * github oauth2
 */
module.exports = {
    
    /**
     * 获取微信 扫码登录页面url
     * @param {string} appid 
     */
    async getLoginUrl(appid, redirect_uri) {
        let url = redirect_uri?redirect_uri:config.host + '/token/union/callback';

        return config.union_wx_url_code.replace('%s', appid)
                                        .replace('%s', encodeURIComponent(url));
    },

    /**
     * 获取微信 access_token
     * @param {string} appid 
     * @param {string} secrit 
     * @param {string} code 
     */
    async getAccessToken(appid, secrit, code) {
        const url = config.union_wx_url_access.replace('%s', appid)
                    .replace('%s', secrit)
                    .replace('%s', code);

        // 认证请求
        try {
            const axiosRes = await axios({
                method: 'GET',
                url: url,
            })
            if (axiosRes.status == 200) {
                const result = axiosRes.data;

                if(result.errcode) {
                    throw new Error('获取微信 access_token错误：' + result);
                }

                try {
                    return result;
                } catch(e) {
                    throw new Error('解析微信 access_token错误(' + result + '):' + e.message);
                }
            } else {
                throw new Error(axiosRes.data.errmsg);
            }
        } catch(e) {
            throw new Error('解析微信 access_token错误：' + e.message);
        }
    },

    /**
     * 获取微信用户信息
     * @param {json} access 
     */
    async getUserInfo(access) {
        try {
            const url = config.union_wx_url_user.replace('%s', access.access_token)
                                                .replace('%s', access.openid);

            const axiosRes = await axios({
                method: 'POST',
                headers: { 'User-Agent': 'cmuser' },
                url: url,
            })


            if (axiosRes.status == 200) {
                return axiosRes.data;
            } else {
                throw new Error(axiosRes.data);
            }
        } catch(e) {
            throw new Error('获取微信用户错误:' + e.message);
        }
    }
}