var UUID = require('uuid');

module.exports = function() {
    return UUID.v1().replace(/\-/g,'');
}