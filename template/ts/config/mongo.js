const mongoose = require('mongoose');
const config = require('./config');

const auth = config.mongo_auth?'?authSource='+config.mongo_auth:"";
mongoose.connect(`mongodb://${config.mongo_user}:${config.mongo_pwd}@${config.mongo_host}/${config.mongo_db}${auth}`, {useNewUrlParser:true, useUnifiedTopology: true}, function(err) {
    if(err) {
        throw new Error(`mongo连接错误 ${err}`);
    }
});
mongoose.set('useCreateIndex', true)

module.exports = mongoose