let app = require('express')(),
	fs = require('fs'),
	https = require('https');

let context,
	config,
	PORT,
	LOCAL,
	dbManager,
	encrypter,
	httpsServer,
	HEALTHCHECK = "/admin/healthcheck";

var cacheData = [];

module.exports.init = function(mainContext) {
	context = mainContext;
	config = context.config;
	dbManager = context.dbManager;
	encrypter = context.encrypter;

	PORT = parseInt(config.PORT, 10) || 8000;
	LOCAL = config.LOCAL || false;

	if (config.HEALTHCHECK) HEALTHCHECK = config.HEALTHCHECK;

	if (!LOCAL) {
		var privateKey = fs.readFileSync('/etc/node/privkey1.pem');
		var certificate = fs.readFileSync('/etc/node/cert1.pem');

		httpsServer = https.createServer({
			key: privateKey,
			cert: certificate
		}, app);
	}


	app.use(rawBodyParser);

	app.post('/uploadData', function(req, res) {
		// console.log('req.rawBody: ' + req.rawBody);
		console.log('Received biodata input');
		var userInfo = JSON.parse(req.rawBody);
		var biometrics = userInfo.biometrics;
		var name = JSON.parse(req.rawBody).fullName;
		// TODO: make name all lower-case?
		var encryptionKey = JSON.parse(req.rawBody).encryptionKey;

		if (encryptionKey.length === 8) {
			encryptionKey += encryptionKey + encryptionKey + encryptionKey;
			// TODO: add timestamp

			// Check to see if user already exists in db
			dbManager.findDoc({"fullName": name}, function(err, userDbData) {
				// TODO: add error handling

				if(userDbData) {
					// Check to see if encryption keys match
					var test = encrypter.decrypt(userDbData.biometrics[0].bodyFat,encryptionKey);
					console.log('test: ' + test);
					if (typeof test !== 'string' || test.toString().includes('Error')) {
						res.send('Invalid encryptionKey!');
						return;
					} else { // TODO: reduce duplicate code
						console.log("Encrypting biometric data....");
						userInfo.biometrics = encrypter.encryptAllValues(biometrics, encryptionKey);
						console.log("Encrypted data: " + JSON.stringify(userInfo));

						// TODO: make dynamic: check first to see if the entry already exists; if so, append to it
						delete userInfo.encryptionKey;

						dbManager.addUserInfo(userInfo);
						res.send('Received data from ' + name);
					}
				} else { // no user found
					console.log("Encrypting biometric data....");
					userInfo.biometrics = encrypter.encryptAllValues(biometrics, encryptionKey);
					console.log("Encrypted data: " + JSON.stringify(userInfo));

					// TODO: make dynamic: check first to see if the entry already exists; if so, append to it
					delete userInfo.encryptionKey;

					dbManager.addUserInfo(userInfo);
					res.send('Received data from ' + name);
				}


			});


		} else {
			res.send('Encryption Key is not the right length!  Must be exactly 8 characters long.');
		}
		// TODO: handle other lengths (if they are multiples of 8)
		// else if (encryptionKey.length % 8 === 0) {
		//
		// }
		// }


	});

	app.post('/showProgress', function(req, res) {
		// console.log('req.rawBody: ' + req.rawBody);
		console.log('Received biodata input');
		var userInfo = JSON.parse(req.rawBody);
		var rawBiometrics = userInfo.biometrics;
		var newBodyFat = userInfo.biometrics.bodyFat;
		var newPulse = userInfo.biometrics.pulse;

		var name = JSON.parse(req.rawBody).fullName;
		// TODO: make name all lower-case?
		var encryptionKey = JSON.parse(req.rawBody).encryptionKey;
		// console.log('encryptionKey.length: ' + encryptionKey.length);

		if (encryptionKey.length != 8) {
			res.send('Encryption Key is not the right length!  Must be exactly 8 characters long.');
		} else {
			encryptionKey += encryptionKey + encryptionKey + encryptionKey;
			// remove encryptionKey from input
			delete userInfo.encryptionKey;
			console.log("Encrypting biometric data....");
			userInfo.biometrics = encrypter.encryptAllValues(rawBiometrics, encryptionKey);
			console.log("Encrypted data: " + JSON.stringify(userInfo));

			// Compare values
			// Get old data
			dbManager.findDoc({
				"fullName": name
			}, function(err, encryptedDoc) {
				if (err) {
					console.error("Error: " + err);
					res.send({
						"Error": err
					});
					// Check to make sure old doc exists
				} else if (!encryptedDoc || Object.keys(encryptedDoc).length < 1) {
					console.error("No docs found for this name");
					res.send("No docs found for this name");
				} else {
					if (!encryptedDoc.biometrics || encryptedDoc.biometrics.length < 1) {
						res.send({
							"error": "No biometric data found for this name"
						});
						return;
					}
					var oldBiometrics = encrypter.decryptAllValues(encryptedDoc.biometrics[encryptedDoc.biometrics.length - 1], encryptionKey);

					console.log("oldBiometrics: " + JSON.stringify(oldBiometrics));

					if (typeof oldBiometrics !== "object") {
						res.send({
							"error": oldBiometrics
						});
						return;
					}

					// TODO: remove this log
					console.log('Decrypted old biometrics:' + JSON.stringify(oldBiometrics, null, 2));

					// Compare bodyfat & heartrate change
					var bodyFatChg = oldBiometrics.bodyFat - newBodyFat;
					var heartRateChg = oldBiometrics.pulse - newPulse;

					// NOTE: temp hack; working on better error-hnadling for invalid encryption keys
					if (!bodyFatChg || !heartRateChg) {
						res.send("Incorrect encryptionKey!");
					} else {
						var results = {
							"Change in BodyFat%": bodyFatChg,
							"Change in resting heart rate": heartRateChg
						};

						// add in newest data
						// dbManager.addUserInfo(userInfo);

						res.jsonp(results);
					}



				}

			});




		}
		// TODO: handle other lengths (if they are multiples of 8)
		// else if (encryptionKey.length % 8 === 0) {
		//
		// }
		// }
		// Remove encryptionKey; don't store it


	});

	// NOTE: this will need an update based on the new encryption strategy... should be able to re-use most of the code though
	app.get('/decryptData', function(req, res) {
		if (req.query.fullName && req.headers.authorization) {
			var encryptionKey = req.headers.authorization;
			// Reformat name (remove dashes)
			var name = req.query.fullName.replace('-', ' ');
			dbManager.findDoc({
				"fullName": name
			}, function(err, doc) {
				if (err) res.jsonp(err);
				console.log('Found doc for ' + name + ": " + JSON.stringify(doc));
				console.log('Decrypting biometric data....');
				var decryptedDoc = encrypter.decryptAllValues(doc.biometrics[0], encryptionKey);
				console.log('Decrypted document: ' + JSON.stringify(decryptedDoc));
				res.jsonp(decryptedDoc);
			});

		} else {
			res.send('Please provide a name & authorization header.');
		}
	});


	app.all('*', function(req, res) {
		res.end('Welcome to the Atlanta Wellness Challenge!');
	});

};

module.exports.listen = function(callback) {
	if (!LOCAL) {
		httpsServer.listen(PORT);
		context.server = httpsServer;
		console.log(`Listening on port ${PORT}...`);
		callback();
	} else {
		let server = app.listen(PORT, () => {
			context.server = server;
			console.log(`Listening on port ${PORT}...`);
			callback();
		});
	}

};

function rawBodyParser(req, res, next) {
	var data = '';
	req.setEncoding('utf8');

	req.on('data', function(chunk) {
		data += chunk;
	});

	req.on('end', function() {
		req.rawBody = data;
		next();
	});

}
