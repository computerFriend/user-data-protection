var MongoClient = require('mongodb').MongoClient,
thisDb;

var connectionString = "mongodb://allie:T55liveagain@bdp-dev-shard-00-00-fbfkb.mongodb.net:27017,bdp-dev-shard-00-01-fbfkb.mongodb.net:27017,bdp-dev-shard-00-02-fbfkb.mongodb.net:27017/test?ssl=true&replicaSet=bdp-dev-shard-0&authSource=admin&retryWrites=true";
console.debug('Connecting to: ' + connectionString);

MongoClient.connect(connectionString, {useNewUrlParser: true}, function(err, db) {

	if (err || db === null) {

		console.fatal('No DB connection', err);
		callback(err);

	} else {

		console.info('Connected to database!');
		 var thisDb = db.db("bdp-dev");
		thisDb.createCollection("userInfo", { retryWrites: true }, function(err) {
			if (err) {
				console.error("An error occurred while trying to create the collection: " + err.toString());
			}
		});

	}
});
