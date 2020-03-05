/*
 * @Author: your name
 * @Date: 2019-12-04 14:42:52
 * @LastEditTime : 2020-01-07 17:43:52
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/config/config.js
 */
const config_production = require('./config_production');
const config_test = require('./config_test');

let config_def = {
    host: 'http://localhost:9999',
    port: 9999,
}

if (process.env.NODE_ENV === 'test') {
    for (let key in config_test) {
        config_def[key] = config_test[key];
    }
} else if (process.env.NODE_ENV === 'pro') {
    for (let key in config_production) {
        config_def[key] = config_production[key];
    }
}

module.exports = config_def