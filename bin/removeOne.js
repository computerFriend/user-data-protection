// Remove 1 doc by _id
var MongoClient = require('mongodb').MongoClient,
	ObjectId = require('mongodb').ObjectID,
thisDb,
userInfoCollection;

var connectionString = "mongodb://allie:borkbork999.@bdp-dev-shard-00-00-fbfkb.mongodb.net:27017,bdp-dev-shard-00-01-fbfkb.mongodb.net:27017,bdp-dev-shard-00-02-fbfkb.mongodb.net:27017/test?ssl=true&replicaSet=bdp-dev-shard-0&authSource=admin&retryWrites=true";
console.debug('Connecting to: ' + connectionString);

MongoClient.connect(connectionString, {useNewUrlParser: true}, function(err, db) {

	if (err || db === null) {

		console.error('No DB connection', err);
		return;

	} else {
		thisDb = db.db("bdp-dev");
		console.info('Connected to database!');
		userInfoCollection = thisDb.collection('userInfo');

		userInfoCollection.deleteOne({_id:new ObjectId('5b8fea7aaa075b3609604004')}, function(err, results) {
			if (err) console.err(error);
			console.log('removed 1 doc');
		});


	}
});
