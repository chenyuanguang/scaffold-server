/*
 * @Author: your name
 * @Date: 2020-01-03 14:52:44
 * @LastEditTime : 2020-01-07 17:26:48
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app/common/union/cmOa.js
 */
const crypto = require('crypto');
const axios = require('axios');
const querystring = require('querystring');
const config = require('../../../config/config');

/**
 * github oauth2
 */
module.exports = {
    /**
     * 获取cmoa oauth2登录页面url
     * @param {string} redirect_url 回调url 
     */
    async getLoginUrl(redirect_url) {
        return config.union_cmoa_url_code.replace('%s', `${encodeURIComponent(config.host + '/api/v1/token/union/callback?platform=cmoa&redirect_url=' + redirect_url)}`);
    },

    /**
     * 获取cmoa 用户
     * @param {string} sid 
     */
    async getUserInfo(sid) {
        const secret = config.union_cmoa_client_secret;
        const access_key = config.union_cmoa_client_access_key;

        let param = {
            access_key,
            cmd: 'cheetah.singleLogin',
            fromat: 'json',
            sid: sid,
            sig_method: 'HmacMD5',
            timestamp: new Date().getTime()
        }

        // 生成sig
        const hmac = crypto.createHmac('md5', secret).update(secret + JSON.stringify(param, '').replace(/[,|"|:|{|}]/g, '')).digest('hex')
        param['sig'] = hmac.toUpperCase();
        console.log(param)
        // 认证请求
        try {
            const axiosRes = await axios({
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                data: querystring.stringify(param),
                url: config.union_cmoa_url_openapi,
            })
            if (axiosRes.status == 200 && axiosRes.data.result == 'ok') {
                console.log(111,axiosRes.data.data)
                return JSON.parse(axiosRes.data.data || '{}')
            } else {
                throw new Error(axiosRes.data);
            }
        } catch (err) {
            throw new Error('oa登录失败:' + err.message);
        }
    }
}