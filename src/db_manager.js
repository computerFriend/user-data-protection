
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

  });
}

function findDoc(query, callback) {

  console.debug('db.findRoute() running query: ' + JSON.stringify(query));
  userInfoCollection.findOne(query, function(error, document) {

    console.log('db manager found document: ' + JSON.stringify(document));

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
  // Check to see if user already exists in DB
  var userExists = false;
  var newBiometrics = userInfo.biometrics;
  console.log('newBiometrics: '+ JSON.stringify(newBiometrics));

  // build query
  var name = userInfo.fullName;
  console.log('name:' + name);

  findDoc({"fullName":name}, function(err,userDbData) {

    if (err) {
      console.error("Error: " + err);
      return;
    } else if (!userDbData || userDbData.length < 1) {
      console.log("No doc found for this user; creating a new entry");
      userInfo.biometrics = [];
      userInfo.biometrics.push(newBiometrics);
      userInfoCollection.insertOne(userInfo, cb);

    } else {
      userExists = true;
      console.log('Found data for user: ' + (JSON.stringify(userDbData)));

      if (Array.isArray(userDbData.biometrics)) {
        userDbData.biometrics.push(newBiometrics);
        userInfo.biometrics = userDbData.biometrics;
        // console.log("updated biometrics array: " + JSON.stringify(userInfo.biometrics));

      } else { // transfer to array
        var allBiometrics = [];
        allBiometrics.push(userDbData.biometrics);
        allBiometrics.push(newBiometrics);
        // console.log("allBiometrics: " + JSON.stringify(allBiometrics));
        userInfo.biometrics = allBiometrics;

      }

      userInfoCollection.update({"fullName":name},userInfo,cb);
      // userInfoCollection.insertOne(userInfo, cb);

    }

  });

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
