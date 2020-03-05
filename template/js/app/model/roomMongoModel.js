const mongoose = require('../../config/mongo');

/**
 * 房间
 */
var scheam = new mongoose.Schema({
    createdAt: Date,
    updatedAt: Date
}, { strict: false, versionKey: false});

module.exports = mongoose.model("Room", scheam);