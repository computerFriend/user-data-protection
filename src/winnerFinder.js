// Select winners
// Input hashmap of encryption keys, decrypt data & print out the deltas for each participant (sorted)

// Initialization
let context,
	config,
	PORT,
	LOCAL,
	dbManager,
	encrypter,
	encryptKeyMap, // store securely in db
	flaggedValues = [],
	async = require('async');

function init(mainContext, cb) {
	context = mainContext;
	config = context.config;
	dbManager = context.dbManager;
	encrypter = context.encrypter;
	// TODO: grab encryptionKeyMap
	cb();
}

// Sort through all docs
function findEligibles(overallCB) {
	var eligibles = [];
	var excluded = 0;
	// TODO: build a query that will automatically filter eligibles for you
	dbManager.findDocs({}, function(err, allDocs) {
		// console.log('Pulled allDocs: ' + JSON.stringify(allDocs, null, 2));
		async.each(allDocs, function(doc, cb) {
			if (doc.biometrics.length > 1) {
				eligibles.push(doc);
				cb(null, eligibles);
			} else {
				excluded++;
				cb(null, excluded);
			}
		}, function(err) {
			if (err) {
				console.log("There was an error processing the documents: " + err);
				overallCB(err);
		} else {
				console.log('There are ' + eligibles.length + ' eligible for winning, and ' + excluded + ' were excluded.');
				overallCB(null, eligibles);
			}
		});

	});
}

// TODO: refactor approach to protect security; find a way to exclude the explicit input of encryptionKeys
// TODO: make more dynamic: input the value that you want to get deltas for, so that you can find delta for anything (not just bodyFat)
function findDeltas(winnerList, callback) {
	var deltaMap =
		{
			// Map of names - get it from db
		};
	async.each(winnerList, function(winner, cb) {
		// Pull the correct encryption key
		var thisEncryptionKey = encryptKeyMap[winner.fullName];
		thisEncryptionKey += thisEncryptionKey + thisEncryptionKey + thisEncryptionKey;

		if (!thisEncryptionKey) {
			console.error('Could not find an encryption key for this name: ' + winner.fullName);
			cb('Could not find an encryption key for this name: ' + winner.fullName);
		} else {
			// Decrypt data & compare it
			var startFat = parseFloat(encrypter.decrypt(winner.biometrics[0].bodyFat, thisEncryptionKey));
			var endFat = parseFloat(encrypter.decrypt(winner.biometrics[winner.biometrics.length-1].bodyFat, thisEncryptionKey));

			if (!startFat || !endFat) {
				console.error('There was a problem decrypting the data.');
				cb('There was a problem decrypting the data.');
			} else {
				var thisDelta = endFat - startFat;
				deltaMap[winner.fullName] = thisDelta;
				if (thisDelta === 0 || Math.abs(thisDelta) > DELTA_TOLERANCE) {
					console.error('Caught a suspicious value: ' + thisDelta + ' for ' + winner.fullName);
					flaggedValues.push({[winner.fullName]: thisDelta});
				}
			}

			// Future TODO: sort the results & return names only, to protect data anonymity
			cb();
		}

	}, function(err) {
		console.log('Completed deltaMap: ' + JSON.stringify(deltaMap,null,2));
		callback(err,deltaMap);
	});
}

module.exports = {
	init,
	findEligibles,
	findDeltas
};
