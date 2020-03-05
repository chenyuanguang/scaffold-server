/*
 * @Author: your name
 * @Date: 2019-12-04 14:42:52
 * @LastEditTime : 2020-01-10 12:01:22
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /liebao/internal-animefactory-server/app.js
 */
const Koa = require('koa');
const koaBody = require('koa-body');
const static = require('koa-static');
const views = require('koa-views');
const config = require('./config/config');
const router = require('./app/router');
const errHandler = require('./app/common/errorHandler');
const Sentry = require('@sentry/node');
const app = new Koa();

app.use(views(__dirname + '/app/view', {
  extension: 'ejs'
}));

app.use(static(__dirname+'/public'));

app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set('Access-Control-Allow-Credentials', true);
    ctx.set("Access-Control-Allow-Methods", "OPTIONS, GET, PUT, POST, DELETE");
    ctx.set("Access-Control-Allow-Headers", "x-requested-with,Authorization,Content-Type,Accept");

    if(ctx.method == 'OPTIONS') {
        ctx.response.status = 200;
    }
    
    await next();
});

app.use(koaBody({
    multipart:true,
    formLimit: "10mb",
    jsonLimit: "10mb",
    textLimit: "10mb",
}));


app.use(errHandler);

app.use(router.routes());

// 正式环境报错后捕获
if(process.env.NODE_ENV==="test"||process.env.NODE_ENV==="pro"){
    Sentry.init({ dsn: 'https://86963fe058f047978e0bd47d0d4a81a2@sentry.cmcm.com/3' });

    app.on('error', (err, ctx) => {
      Sentry.withScope(function(scope) {
        scope.addEventProcessor(function(event) {
          return Sentry.Handlers.parseRequest(event, ctx.request); 
        });
        Sentry.captureException(err);
      });
    }); 
}



app.listen(config.port);

const env = process.env.NODE_ENV?process.env.NODE_ENV:'def';
console.log('cmuser started by port ' + config.port + ' in ' + env);