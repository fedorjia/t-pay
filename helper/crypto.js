const crypto = require('crypto');

/**
 * md5
 */
exports.md5 = function(str, salt) {
    const hash = crypto.createHash('md5');
    hash.update(str + (salt || ''));
    // hash.update(new Buffer(str + (salt || '')).toString('binary'));
    return hash.digest('hex');
};

/**
 * sha256
 */
exports.sha256 = function(str, secret) {
    return crypto.createHmac('sha256', secret).update(str).digest('hex');
};

/**
 * sha1
 */
exports.sha1 = function(str) {
    return crypto.createHash('sha1').update(str).digest('hex');
};

/**
 * unique id
 */
exports.unique = function(len) {
    len = len || 24;
    return crypto.randomBytes(Math.ceil(len/2)).toString('hex').slice(0,len);
};
