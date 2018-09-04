
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
      console.error('No DB connection', err);
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
  userInfoCollection.findOne(query, function(error, document) {

    console.log('db manager found document: ' + document);

    if(error || document == null) {
      console.error('Error running query: ' + JSON.stringify(query), error);
      callback(error, null);

    } else {
      // console.log('db manager found document: ' + document);
      callback(null, document);
    }
  });
}

// Filter function
function findDocs(query, callback) {

  userInfoCollection.find(query).toArray(function(error, documents) {

    if(error) {

      console.error('Error getting all routes from db', error);
      callback(error, null);

    } else {

      callback(null, documents);
    }
  });
}

function addUserInfo(userInfo, cb) {
  // 1) TODO: Check to see if user already exists in DB


  // 2) If user doesn't exist, wrap biometric data in array
  // NOTE: for now, assuming all users are new
  var firstBiometrics = userInfo.biometrics;
  userInfo.biometrics = [];
  userInfo.biometrics.push(firstBiometrics);

  // 3) If user DOES exist, append biometric data array
// TODO

  userInfoCollection.insertOne(userInfo, cb);
}

function setIndexes(callback) {
  //placeholder
  callback();
}


module.exports = {
  init: init,
  addUserInfo: addUserInfo,
  findDoc: findDoc,
  findDocs: findDocs
};
