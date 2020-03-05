/*
 * @Author: your name
 * @Date: 2019-12-04 14:42:52
 * @LastEditTime: 2020-01-06 18:03:08
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/config/config_production.js
 */
module.exports = {
    host: 'http://animefactory.cmcm.com',
    port: 3003,

    mongo_host: '127.0.0.1',
    mongo_auth: 'admin',
    mongo_db: 'animefactory',
    mongo_user: 'admin',
    mongo_pwd: 'admin',

    build_platform: 'http://114.255.181.150:9000/cim/build/run_task',
    build_repos_code: 'RAF19101800892',

    ftp_host: '127.0.0.1',
}