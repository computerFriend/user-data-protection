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
		var name = JSON.parse(req.rawBody).name;
		// TODO: make name all lower-case?
		var encryptionKey = JSON.parse(req.rawBody).encryptionKey;
		//  TODO: add timestamp

		console.log("Encrypting data....");
		var encryptedData = encrypter.encryptAllValues(userInfo, encryptionKey);
		console.log("Encrypted data: " + JSON.stringify(encryptedData));

		dbManager.addUserInfo(encryptedData);

		res.send('Received data from ' + name);
	});

	app.get('/decryptData', function(req, res) {
		if (req.query.name && req.headers.authorization) {
			var encryptionKey = req.headers.authorization;
			// Reformat name (remove dashes)
			var name = req.query.name.replace('-',' ');
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
