const crypto = require('crypto')
const fs = require('fs')

exports.decipher = function(a) {
  // return new Promise((resolve, reject) => {
    const key = Buffer.from('9bccc1c115e90300407267590ad259b3cf3964dc83b15dba8c922b3a14ea756c', 'hex')
    const iv = Buffer.from('a91736286713b391c223c98e95b04948', 'hex')
    let decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decryptedData = decipher.update(a, 'base64', 'utf8')
    decryptedData += decipher.final('utf8')
    return decryptedData
  // })
};

// exports.decipher = function(a) {
//
// };
