const app = require('express')(),
	async = require('async'),
	fileUpload = require('express-fileupload'),
	cors = require('cors');
	// encryptionKey = 'VALgYfeD7ee6NBYKD6E8haD2Hv3Q5zZ8'; // TODO: take from user input

	app.use(rawBodyParser);

let context,
	config,
	PORT,
	dbManager,
	encrypter,
	HEALTHCHECK = "/admin/healthcheck";

	var cacheData = [];

module.exports.init = function(mainContext) {
	context = mainContext;
	config = context.config;
	dbManager = context.dbManager;
	encrypter = context.encrypter;

	PORT = parseInt(config.PORT, 10);

	if (config.HEALTHCHECK) HEALTHCHECK = config.HEALTHCHECK;

	app.post('/uploadData', function(req, res) {
		console.log('req.rawBody: ' + req.rawBody);
		var userInfo = JSON.parse(req.rawBody);
		var biometrics = userInfo.biometrics;
		var name = JSON.parse(req.rawBody).fullName;
		// TODO: make name all lower-case?
		var encryptionKey = JSON.parse(req.rawBody).encryptionKey;
		// Remove encryptionKey; don't store it
		delete userInfo.encryptionKey;
		//  TODO: add timestamp

		console.log("Encrypting biometric data....");
		userInfo.biometrics = encrypter.encryptAllValues(biometrics, encryptionKey);
		console.log("Encrypted data: " + JSON.stringify(userInfo));



		// TODO: make dynamic: check first to see if the entry already exists; if so, append to it
		dbManager.addUserInfo(userInfo);

		res.send('Received data from ' + name);
	});

// NOTE: this will need an update based on the new encryption strategy... should be able to re-use most of the code though
	app.get('/decryptData', function(req, res) {
		if (req.query.fullName && req.headers.authorization) {
			var encryptionKey = req.headers.authorization;
			// Reformat name (remove dashes)
			var name = req.query.fullName.replace('-',' ');
			dbManager.findDoc({"name":name}, function(err, doc) {
				console.log('Found doc for ' + name + ": " + JSON.stringify(doc));
				console.log('Decrypting....');
				var decryptedDoc = encrypter.decryptAllValues(doc,encryptionKey);
				console.log('Decrypted document: ' + JSON.stringify(decryptedDoc));
				res.jsonp(decryptedDoc);
			});

		} else {
			res.send('Please provide a name & authorization header.');
		}
	});


	app.all('*', function(req,res) {
		res.end('Welcome to the Atlanta Wellness Challenge!');
	});

};

module.exports.listen = function(callback) {
	let server = app.listen(PORT, () => {
		context.server = server;
		console.log(`Listening on port ${PORT}...`);
		callback();
	});
};

function rawBodyParser(req, res, next) {
	var data = '';
	req.setEncoding('utf8');

	req.on('data', function(chunk) {
		data += chunk;
	});

	req.on('end',function () {
		req.rawBody = data;
		next();
	});

}
