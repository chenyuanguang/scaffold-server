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
    host: 'http://localhost:3003',
    port: 3003,

    // mongo_host: '127.0.0.1',
    // mongo_auth: '',
    // mongo_db: 'animefactory',
    // mongo_user: '',
    // mongo_pwd: '',

    // mongo_host: '62.234.146.38',
    mongo_host: '62.234.188.175',
    mongo_auth: 'admin',
    mongo_db: 'animefactory',
    mongo_user: 'admin',
    mongo_pwd: 'admin',

    token_active_time: 60 * 60 * 24 * 7, //token有效时间，单位秒
    
    public_key: 'LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHZk1BMEdDU3FHU0liM0RRRUJBUVVBQTRHTkFEQ0JpUUtCZ1FDb1l3b1JFZ2VEbTZvaVQ5dHdqQmZvQXFUYwpKR003VHRjd0t5YkZZVGRKTVZzNFNBQ0lZcHd3RnJqcDdYTEdueDJuaFdiUnRMczhCNEduVjk1emFiLzhRdnF2CjFGWFVwbHV2b0VmckRZSEFBeFpVSE9QNS9La2hMZXlyWFRxWHVndk5oQ0ZwblQrM2c3SVlkWi9HaXE2V25odG8KWFFSc1BWZWoyWWNaeUwrVThRSURBUUFCCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==',
    private_key: 'LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUNkZ0lCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQW1Bd2dnSmNBZ0VBQW9HQkFLaGpDaEVTQjRPYnFpSlAKMjNDTUYrZ0NwTndrWXp0TzF6QXJKc1ZoTjBreFd6aElBSWhpbkRBV3VPbnRjc2FmSGFlRlp0RzB1endIZ2FkWAozbk5wdi94QytxL1VWZFNtVzYrZ1Irc05nY0FERmxRYzQvbjhxU0V0N0t0ZE9wZTZDODJFSVdtZFA3ZURzaGgxCm44YUtycGFlRzJoZEJHdzlWNlBaaHhuSXY1VHhBZ01CQUFFQ2dZQllmNVR1MjlidktJVUdlNG9OWU5PL3NJUU0KMzJMMzdMdlVLUm03YXhpdmN5MUtLeTE4Z0xjdDN3TllqdDlmM0lpdFhzTm5PK0diN3lZSldYa2tsMU82MndCMwpHa2h3WCtGMnJUaGF0K2ZNVStTL1VJWDllSXc0ajloUGZ5WmtMRnMxMjk2TUdtT241eHAyY1lQQzNXcm9PcTE2CmhHS3lMcGhuRDE4cWptTExBUUpCQU5PM1huclJCOXYwNmlLWFFXZUZ1Z1MwWEtRYmJMSGcvZEIzM2twNWpGTTIKaW1PMHlqaG9yZkxmbCszclJKTzRWMHJKMjc1UWNGdHlZa3NQSmVyTk05a0NRUURMbTRuK1Y0L1FMMTNWazlOYgpXRTFCNCtQZTVPMit4ZjFIL0RHWHFRYzRHbDNjT05XTnp4VWp3ZGVUOTR0d2lzTm14MVFQakFJczZkSjFtU1ZpCmVITFpBa0IwbnRsSVJjUlNnUUpIczVHdmVKWVM2VmJ1ZnJ6TTd1Wmc0dVpybDdDWVZiNjlWV1RlMWFxYjBsWmEKRS9KZWZIaDVGZUFaWVMzQzhhcjdOWWpwWWNkaEFrRUF1akFmdm1BZitNWjN6a2tCNi9RUm9nRmRiWVIzREE5TgprRGhFdVdVdVh0VnRvMmF0a3FJZHVMY1lCZzFHaThHNDhoR3hBdzZMSnJzalk3cUovMFFaOFFKQVdOVnpEZWlECjBKOE02WjhmSEJVYkhUbCtqUjB3UmQyczUxNkw4WE9Ba0kxVjlxN0c2bEdxeEJJWnBwSEpjbXAyYk05R1huVVYKazdJc0ZvVkl6N3dZOHc9PQotLS0tLUVORCBQUklWQVRFIEtFWS0tLS0t',
    //cm oa
    union_cmoa_url_code: 'https://abccmproxy.cmcm.com/r/w?cmd=API_com.cm.cheetah.httpapi.login&forward=%s',
    union_cmoa_url_openapi: 'https://abccmproxy.cmcm.com/openapi',
    union_cmoa_client_secret: '9442a90dj63a798c41',
    union_cmoa_client_access_key: '5bbb46kobf1b4087a',
    
    cos_id: 'AKIDsVtb3Ne7bpoY6ONN0OWP2TfeQwDEIUnq',
    cos_key: 'zmJejZAakkoiMlv1sToumQo11GH6fz4u',
    cos_bucket: 'ux-animefactory-1252921383',
    cos_region: 'ap-beijing',
    cos_path: 'animefactory',

    ftp_host: '62.234.188.175',
    ftp_port: 21,
    ftp_user: 'CartoonFactoryres',
    ftp_pwd: 'CartoonFactoryres@123',
    ftp_apk_user: 'CartoonFactoryres',
    ftp_apk_pwd: 'CartoonFactoryres@123',
    // ftp_apk_user: 'cartoonfactory',
    // ftp_apk_pwd: 'cartoonfactory123',

    build_platform: 'http://10.60.134.62:8000/cim/build/run_task',
    build_repos_code: 'RAF19101800887'
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