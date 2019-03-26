  async = require('async');
  let context = {};

  function initConfig(callback) {
  	context.config = require("./config/config");
  	callback();
  }

  function initDbManager(callback) {
  	context.dbManager = require('./src/db_manager');
  	context.dbManager.init(context);
  	callback();
  }

  function initEncrypter(cb) {
  	context.encrypter = require('./src/encrypter');
  	// context.encrypter.init(context);
  	cb();
  }

  function initController(callback) {
  	context.controller = require('./src/controller');
  	context.controller.init(context);
  	callback();
  }

  function initWinnerFinder(cb) {
    context.winnerFinder = require('./src/winnerFinder');
    context.winnerFinder.init(context, cb);
    // cb();
  }

  function listen(callback) {
  	context.controller.listen(callback);
  }

  function serviceReady(err) {
  	if (err) {
  		// Throw the error so we can "catch it" and die.
  		throw err;
  	} else {
  		console.log("Service is Ready");
  	}
  }

  // process.on("SIGINT", processSignal("SIGINT"));
  // process.on("SIGTERM", processSignal("SIGTERM"));
  // process.on("uncaughtException", (err) => {
  //   if (context.logClient) {
  //     context.logClient.error("uncaughtException occurred:", err);
  //   } else {
  //     console.error(err);
  //   }
  //   setImmediate(processSignal("uncaughtException"));
  //
  // });

  async.series([initConfig, initDbManager, initEncrypter, initWinnerFinder, initController, listen], serviceReady);
