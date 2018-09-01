
var MongoClient = require('mongodb').MongoClient,
    async = require('async'),
    context,
    thisDb;


function init(contextObj, cb) {

  context = contextObj;
  config = context.config;

  var connectionString = config.DB_CONNECTION_STRING;
  console.debug('Connecting to: ' + connectionString);

  MongoClient.connect(connectionString, { useNewUrlParser: true }, function(err, db) {

    if (err || db === null) {
      console.fatal('No DB connection', err);
      cb(err);

    } else {

      console.info('Connected to database!');
      thisDb = db.db("bdp-dev");
      userInfoCollection = thisDb.collection('userInfo');
    }

    // setIndexes(function(err) {
    //   // cb();
    //   return;
    // });


  });
}

function findDoc(query, callback) {

  console.debug('db.findRoute() running query: ' + JSON.stringify(query));

  routesCollection.findOne(query, function(error, document) {

    if(error) {
      console.error('Error running query: ' + JSON.stringify(query), error);
      callback(error, null);

    } else {
      callback(null, document);
    }
  });
}

// Filter function
function findDocs(query, callback) {

  routesCollection.find(query).toArray(function(error, documents) {

    if(error) {

      console.error('Error getting all routes from db', error);
      callback(error, null);

    } else {

      callback(null, documents);
    }
  });
}

function setIndexes(callback) {
  //placeholder
  callback();
}


module.exports = {
  init: init,
  findDocs: findDocs
};
