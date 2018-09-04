'use strict';

// NOTE: Shamelessly stole most of this code from: http://vancelucas.com/blog/stronger-encryption-and-decryption-in-node-js/

const crypto = require('crypto');
const IV_LENGTH = 16; // For AES, this is always 16

function encryptAllValues(obj, encryptionKey) {
	Object.keys(obj).forEach(function(key) {
		if (key !== "fullName") obj[key] = encrypt(obj[key], encryptionKey);
	});
	return obj;
}

function encrypt(text, encryptionKey) {
 let iv = crypto.randomBytes(IV_LENGTH);
 let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(encryptionKey), iv);
 let encrypted = cipher.update(text);

 encrypted = Buffer.concat([encrypted, cipher.final()]);

 return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptAllValues(obj,encryptionKey) {
	Object.keys(obj).forEach(function(key) {
		if (key !== "fullName" && key !== "_id") obj[key] = decrypt(obj[key], encryptionKey);
	});
	return obj;
}

function decrypt(text, encryptionKey) {
	if (text.length < 1) {return new Error('Empty text input!');} else {
		let textParts = text.split(':');
	  let iv = new Buffer(textParts.shift(), 'hex');
	  let encryptedText = new Buffer(textParts.join(':'), 'hex');
	  let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(encryptionKey), iv);
	  let decrypted = decipher.update(encryptedText);

	  decrypted = Buffer.concat([decrypted, decipher.final()]);

	  return decrypted.toString();
	}

}

module.exports = { decrypt, decryptAllValues, encrypt, encryptAllValues };
