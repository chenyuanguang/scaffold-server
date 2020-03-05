const router = require('koa-router')();

// token
const baseController = require('./controller/baseController');
router.get('/view/index', baseController.view);
router.get('/view/gitlab', baseController.gitlab);
router.get('/view/centry', baseController.centry);
router.post('/sendConfig', baseController.sendConfig);
router.get('/getCreateStatus', baseController.getCreateStatus);

module.exports = router;