// Clear collection of docs

var MongoClient = require('mongodb').MongoClient,
	thisDb, userInfoCollection;

var connectionString = "mongodb://allie:borkbork999.@bdp-dev-shard-00-00-fbfkb.mongodb.net:27017,bdp-dev-shard-00-01-fbfkb.mongodb.net:27017,bdp-dev-shard-00-02-fbfkb.mongodb.net:27017/test?ssl=true&replicaSet=bdp-dev-shard-0&authSource=admin&retryWrites=true";
console.debug('Connecting to: ' + connectionString);

MongoClient.connect(connectionString, {
	useNewUrlParser: true
}, function(err, db) {

	if (err || db === null) {

		console.fatal('No DB connection', err);
		callback(err);

	} else {

		console.info('Connected to database!');
		var thisDb = db.db("bdp-dev");
		thisDb.collection("userInfo").deleteMany({}, function(err, obj) {
			if (err) throw err;
			console.log(obj.result.n + " document(s) deleted");
			db.close();
		});


	}
});
