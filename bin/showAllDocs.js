var MongoClient = require('mongodb').MongoClient,
thisDb,
userInfoCollection;

var connectionString = "mongodb://allie:T55liveagain@bdp-dev-shard-00-00-fbfkb.mongodb.net:27017,bdp-dev-shard-00-01-fbfkb.mongodb.net:27017,bdp-dev-shard-00-02-fbfkb.mongodb.net:27017/test?ssl=true&replicaSet=bdp-dev-shard-0&authSource=admin&retryWrites=true";
console.debug('Connecting to: ' + connectionString);

MongoClient.connect(connectionString, {useNewUrlParser: true}, function(err, db) {

	if (err || db === null) {

		console.fatal('No DB connection', err);
		return;

	} else {
		thisDb = db.db("bdp-dev");
		console.info('Connected to database!');
		userInfoCollection = thisDb.collection('userInfo');

		userInfoCollection.find().toArray(function(err,allDocs) {
			console.log('All docs: ' + (JSON.stringify(allDocs)));
		});

		// Find one route
		// userInfoCollection.findOne({"test":"boop"}, function(err,allDocs) {
		// 	console.log('All docs: ' + (JSON.stringify(allDocs)));
		// 	console.log('Keys of allDocs: ' + Object.keys(allDocs));
		//
		// });
		var allDocsCount = userInfoCollection.find().count(function(err, count) {
			if (err) return;
			console.log('Total number of docs: ' + count);
		});

	}
});
