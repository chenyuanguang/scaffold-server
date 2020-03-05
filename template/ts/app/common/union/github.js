const axios = require('axios');
const config = require('../../../config/config');

/**
 * github oauth2
 */
module.exports = {
    /**
     * 获取github oauth2登录页面url
     */
    async getLoginUrl() {
        return config.union_github_url_code.replace('%s', config.union_github_client_id);
    },

    /**
     * 获取github access_token
     * @param {string} code 
     */
    async getAccessToken(appid, secret, code) {
        const url = config.union_github_url_access.replace('%s', appid)
                    .replace('%s', secret)
                    .replace('%s', code);

        // 认证请求
        try {
            const axiosRes = await axios({
                method: 'GET',
                url: url,
            })
            if (axiosRes.status == 200 && axiosRes.data.result == 'ok') {
                const result = axiosRes.data.data;

                if(result.startsWith('error')) {
                    throw new Error('获取github access_token错误：' + result);
                }

                try {
                    return result.split('&')[0].split('=')[1];
                } catch(e) {
                    throw new Error('解析github access_token错误(' + result + '):' + e.message);
                }
            } else {
                throw new Error(axiosRes.data);
            }
        } catch(e) {
            throw new Error('获取github access_token错误：' + e.message);
        }
    },

    /**
     * 获取github用户信息
     * @param {string} accessToken 
     */
    async getUserInfo(accessToken) {
        try {
            const url = config.union_github_url_user.replace('%s', accessToken);

            const axiosRes = await axios({
                method: 'POST',
                headers: { 'User-Agent': 'cmuser' },
                url: url,
            })


            if (axiosRes.status == 200 && axiosRes.data.result == 'ok') {
                return JSON.parse(axiosRes.data.data);
            } else {
                throw new Error(axiosRes.data);
            }
        } catch(e) {
            throw new Error('获取github用户错误:' + e.message);
        }
    }
}