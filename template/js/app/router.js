const router = require('koa-router')();
const permissionMid = require('./middleware/permission');

const baseUrl = '/api/v1/'
// http://62.234.146.38/token/union?redirect_url=http://animefactory.cmcm.com/#/dashboard/myAnime

// http://localhost:3003/api/v1/token/union?redirect_url=http://animefactory.cmcm.com/#/dashboard/myAnime
// ["5df35cb52670106974a16ea8","5dee15c3528e9875d49e6577"]
//c9e73f20310e11eaa44b05cfd24c3c8b
// token
const tokenController = require('./controller/tokenController');
router.get(baseUrl+'token/union', tokenController.toUnionLogUrl);
router.get(baseUrl+'token/union/callback', tokenController.unionCallback);

// user
const userController = require('./controller/userController');
router.get(baseUrl+'user', permissionMid, userController.get);
router.get(baseUrl+'user/getlist', permissionMid, userController.getList);
router.put(baseUrl+'user/:id', permissionMid, userController.update);

// permission
const permissionController = require('./controller/permissionController');
router.post(baseUrl+'permission/add', permissionMid, permissionController.create);


// base
const baseController = require( './controller/baseController');
// 打包平台打包后，调用此接口通知打包结果
router.post(baseUrl+'notify', baseController.notify);
router.get(baseUrl+'view/avator', baseController.groupAvatorHtml);
router.get(baseUrl+'view/chapter', baseController.chapterHtml);
router.get(baseUrl+'view/thumbnail', baseController.thumbnailHtml);
router.post(baseUrl+'upload', baseController.upload);
router.get(baseUrl+'down', baseController.down);
router.get(baseUrl+'json/chat/:id', baseController.jsonByChat);
router.get(baseUrl+'json/sms/:id', baseController.jsonBySms);
// 自动打包apk
router.get(baseUrl+'json/package/:id', baseController.autoPackage);
//打包资源
router.get(baseUrl+'json/resource/:id', baseController.autoResource);

router.get(baseUrl+'json/resource/status/:id', permissionMid, baseController.getStatus);


// 打包信息实时获取
const packageController = require( './controller/packageController');
router.get(baseUrl+'package', packageController.query);


// app拉取信息（发布过的表中拉取）
const publicCartoonController = require( './controller/publicCartoonController');
router.get(baseUrl+'cartoon/pull/:packageName', publicCartoonController.pull);
// 手动同步编辑表和发布表
router.get(baseUrl+'cartoon/sync',permissionMid, publicCartoonController.sync);
// 发布
router.get(baseUrl+'cartoon/public/:packageName', permissionMid,publicCartoonController.public);
router.get(baseUrl+'cartoon/public/status/:packageName',permissionMid, publicCartoonController.getStatus);


// 漫画
const cartoonController = require( './controller/cartoonController');
router.post(baseUrl+'cartoon', permissionMid, cartoonController.create);
router.get(baseUrl+'cartoon/delReal/:id', cartoonController.delReal);
router.get(baseUrl+'cartoon/:id', permissionMid, cartoonController.find);
router.get(baseUrl+'cartoon', permissionMid, cartoonController.query);
router.put(baseUrl+'cartoon/:id', permissionMid, cartoonController.update);
router.delete(baseUrl+'cartoon/:id', permissionMid, cartoonController.del);


// 'http://localhost:3003/api/v1/cartoon/delReal/5db0375e1245a442e7d1ea60'

// 章节
const chapterController = require( './controller/chapterController');
router.get(baseUrl+'chapter/pull/resource/:id', chapterController.pullResource);
router.get(baseUrl+'chapter/pull/:id', chapterController.pull);
router.post(baseUrl+'chapter', permissionMid, chapterController.create);
router.get(baseUrl+'chapter/:id', permissionMid, chapterController.find);
router.get(baseUrl+'chapter', permissionMid, chapterController.query);
router.put(baseUrl+'chapter/:id', permissionMid, chapterController.update);
router.delete(baseUrl+'chapter/:id', permissionMid, chapterController.del);

// 互动游戏
const gameController = require( './controller/gameController');
router.get(baseUrl+'game/pull/:id', gameController.pull);
router.post(baseUrl+'game', gameController.create);
router.get(baseUrl+'game/:id', gameController.find);
router.get(baseUrl+'game', gameController.query);
router.put(baseUrl+'game/:id', gameController.update);
router.delete(baseUrl+'game/:id', gameController.del);

// 立绘
const paintController = require( './controller/paintController');
router.post(baseUrl+'paint', permissionMid, paintController.create);
router.get(baseUrl+'paint/:id', permissionMid, paintController.find);
router.get(baseUrl+'paint', permissionMid, paintController.query);
router.put(baseUrl+'paint/:id', permissionMid, paintController.update);
router.delete(baseUrl+'paint/:id', permissionMid, paintController.del);

// 角色
const characterController = require( './controller/characterController');
router.post(baseUrl+'character', characterController.create);
router.get(baseUrl+'character/:id', characterController.find);
router.get(baseUrl+'character', characterController.query);
router.put(baseUrl+'character/:id', characterController.update);
router.delete(baseUrl+'character/:id', characterController.del);

// 短信
const smsController = require( './controller/smsController');
router.post(baseUrl+'sms', smsController.create);
router.get(baseUrl+'sms/:id', smsController.find);
router.get(baseUrl+'sms', smsController.query);
router.put(baseUrl+'sms/:id', smsController.update);
router.delete(baseUrl+'sms/:id', smsController.del);

// 对话包
const chatController = require( './controller/chatController');
const publicChatController=require("./controller/publicChatController")
// 恋恋导出场景语音聊天
router.get(baseUrl+'chat/export/:id', chatController.exportScene);
router.post(baseUrl+'chat', chatController.create);

// =======测试，手动同步数据接口===========
router.get(baseUrl+'chat/sync', publicChatController.sync);

router.get(baseUrl+'chat/:id', chatController.find);
router.put(baseUrl+'chat/:id',chatController.update);
router.delete(baseUrl+'chat/:id',chatController.del);
router.get(baseUrl+'chat/pull/:id', publicChatController.pull);
router.get(baseUrl+'chat/public/:id', publicChatController.public);




// 对话item
const itemController = require( './controller/itemController');
router.post(baseUrl+'item', itemController.create);
router.get(baseUrl+'item/:id', itemController.find);
router.get(baseUrl+'item', itemController.query);
router.put(baseUrl+'item/:id', itemController.update);
router.delete(baseUrl+'item/:id', itemController.del);

// 对话logic
const logicController = require( './controller/logicController');
router.post(baseUrl+'logic', logicController.create);
router.get(baseUrl+'logic/:id', logicController.find);
router.get(baseUrl+'logic', logicController.query);
router.put(baseUrl+'logic/:id', logicController.update);
router.delete(baseUrl+'logic/:id', logicController.del);

// 扮装
const dressController = require( './controller/dressController');
router.get(baseUrl+'dress/pull', permissionMid, dressController.pull);
router.post(baseUrl+'dress', permissionMid, dressController.create);
router.get(baseUrl+'dress/:id', permissionMid, dressController.find);
router.get(baseUrl+'dress', permissionMid, dressController.query);
router.put(baseUrl+'dress/:id', permissionMid, dressController.update);
router.delete(baseUrl+'dress/:id', permissionMid, dressController.del);

// 房间
const roomController = require( './controller/roomController');
router.post(baseUrl+'room', permissionMid, roomController.create);
router.get(baseUrl+'room/:id', permissionMid, roomController.find);
router.get(baseUrl+'room', permissionMid, roomController.query);
router.put(baseUrl+'room/:id', permissionMid, roomController.update);
router.delete(baseUrl+'room/:id', permissionMid, roomController.del);

module.exports = router;