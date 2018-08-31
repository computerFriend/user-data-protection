
var MongoClient = require('mongodb').MongoClient,
    async = require('async'),
    context,
    dbConnection;


function init(contextObj, callback) {

  context = contextObj;
  settings = context.settings;

  var connectionString = config.DB_CONNECTION_STRING;
  console.debug('Connecting to: ' + connectionString);

  MongoClient.connect(connectionString, function(err, db) {

    if (err || db === null) {

      console.fatal('No DB connection', err);
      callback(err);

    } else {

      console.info('Connected to database!');

      dbConnection = db;
      // routesCollection = dbConnection.collection('routes');

      setIndexes(function(err) {

        if(err) {
          console.error('Error returned from setIndexes()',null,null, err);
        }

        callback();
      });
    }
  });
}

function findDoc(instance, version, upstreamId, action, exclusions, callback) {

  var query = {
    'instance' : instance,
    'version' : version,
    'upstreamId' : upstreamId,
    'action' : action
  };

  console.debug('db.findRoute() running query: ' + JSON.stringify(query));

  // TODO check if query is a key in the cache object

  routesCollection.findOne(query, exclusions, function(error, document) {

    if(error) {
      console.error('Error running query: ' + JSON.stringify(query), error);
      callback(error, null);

    } else {
      callback(null, document);
    }
  });
}

// Filter function
function findDocs(version, instanceId, action, upstreamId, projection, callback) {

  var query = {};

  if(version) {
    query['version'] = version;
  }

  if(instanceId) {
    query['instance'] = instanceId;
  }

  if(action) {
    query['action'] = action;
  }

  if (upstreamId) {
    query['upstreamId'] = upstreamId;
  }

  if(!projection) {
    projection = {};
  }

  routesCollection.find(query, projection).toArray(function(error, documents) {

    if(error) {

      console.error('Error getting all routes from db', error);
      callback(error, null);

    } else {

      callback(null, documents);
    }
  });
}




// TODO setup indexes
function setIndexes(callback) {
  callback();

  // routesCollection.ensureIndex({'brand' : 1, 'lastUpdate' : -1} , {}, function(err, indexName) { // for v1, kill me eventually
  //   if(err) {
  //     console.error('Error setting index', err);
  //   }
  // });
}


module.exports = {
  init: init,
  findDocs: findDocs
};
