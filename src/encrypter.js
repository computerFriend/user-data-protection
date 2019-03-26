// 'use strict';

// NOTE: Shamelessly stole most of this code from: http://vancelucas.com/blog/stronger-encryption-and-decryption-in-node-js/

const crypto = require('crypto');
const IV_LENGTH = 16; // For AES, this is always 16

function encryptAllValues(obj, encryptionKey) {
	Object.keys(obj).forEach(function(key) {
		if (key == "bodyFat" || key == "weight" || key == "pulse") {
		 obj[key] = encrypt(obj[key], encryptionKey);
	 }
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
	var errorFlag = false;
	var errorMsg = "Unknown decryption error";
	Object.keys(obj).forEach(function(key) {
		if (errorFlag) {
			console.log("errorFlag is true!");
			return errorMsg;
		}
		if (key == "bodyFat" || key == "weight" || key == "pulse") {
			// console.log("Decrypting this val: " + obj[key]);
			obj[key] = decrypt(obj[key], encryptionKey);
				// check for errors
			if (typeof obj[key] !== 'string') {
				console.log('error condition matched!');
				errorFlag = true;
				return new Error(obj[key]);
			}
		}
	});
	return obj;
}

function decrypt(text, encryptionKey) {
	// console.log('received this text to decrypt: ' + text);
	if (text.length < 1) {
		return new Error('Empty text input!');
	} else if (encryptionKey.length != 32) {
		console.log("Error: Encryption key length is " + encryptionKey.length + " instead of 32.");
	} else {
		var textParts = text.split(':');
	  let iv = new Buffer(textParts.shift(), 'hex');
	  let encryptedText = new Buffer(textParts.join(':'), 'hex');

		try {
			let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(encryptionKey), iv);
		  let decrypted = decipher.update(encryptedText);
		  decrypted = Buffer.concat([decrypted, decipher.final()]);
		  return decrypted.toString();
		} catch (err) {
			// TODO: find a way to persist / propagate error msgs
			console.log("Decryption error: " + err);
			if (err.toString().includes("bad decrypt")) {
				console.log("Invalid encryption key!");
				errorMsg = "Invalid encryption key!";
				return new Error('Invalid encryption key!');
			} else {
				return new Error('Unknown decryption error: ' + err);
			}
		}

	}

}

module.exports = { decrypt, decryptAllValues, encrypt, encryptAllValues };
