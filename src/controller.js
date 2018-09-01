const app = require('express')(),
	async = require('async'),
	fileUpload = require('express-fileupload'),
	cors = require('cors');

	// app.use(rawBodyParser);
	app.use(cors());

let context,
	config,
	PORT,
	HEALTHCHECK = "/admin/healthcheck";

	var cacheData = [];

module.exports.init = function(mainContext) {
	context = mainContext;
	config = context.config;

	PORT = parseInt(config.PORT, 10);

	if (config.HEALTHCHECK) HEALTHCHECK = config.HEALTHCHECK;


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
