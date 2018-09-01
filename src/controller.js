const app = require('express')(),
	async = require('async'),
	fileUpload = require('express-fileupload'),
	cors = require('cors');

	app.use(rawBodyParser);
	// app.use(cors());

let context,
	config,
	PORT,
	dbManager,
	HEALTHCHECK = "/admin/healthcheck";

	var cacheData = [];

module.exports.init = function(mainContext) {
	context = mainContext;
	config = context.config;
	dbManager = context.dbManager;

	PORT = parseInt(config.PORT, 10);

	if (config.HEALTHCHECK) HEALTHCHECK = config.HEALTHCHECK;

	app.post('/uploadData', function(req, res) {
		// console.log('req.body: ' + JSON.stringify(req.body));
		console.log('req.rawBody: ' + req.rawBody);
		var userInfo = JSON.parse(req.rawBody);
		var name = JSON.parse(req.rawBody).name;
		console.log("Name: " + name);
		dbManager.addUserInfo(userInfo);
		//  TODO: add timestamp
		res.send('Received data from ' + name);
	});


	app.all('*', function(req,res) {
		res.end('Welcome to the Atlanta Wellness Challenge!');
	});

};

module.exports.listen = function(callback) {
	let server = app.listen(PORT, () => {
		context.server = server;
		console.log(`Listening on port ${PORT}...`);
		callback();
	});
};

function rawBodyParser(req, res, next) {
	var data = '';
	req.setEncoding('utf8');

	req.on('data', function(chunk) {
		data += chunk;
	});

	req.on('end',function () {
		req.rawBody = data;
		next();
	});

}
