const app = require('express')(),
	async = require('async'),
	fileUpload = require('express-fileupload'),
	cors = require('cors');

	let downloadPath = './';

	// app.use(rawBodyParser);
	app.use(cors());
	app.use(fileUpload());

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

	app.post('/echoData', (q, res) => {
		var reqBody;
		// try {
		// 	reqBody = JSON.parse(req);
		// 	res.end(reqBody); // echo the request back
		// } catch (parseError) {
		// 	console.error('Error parsing POST request: ' + parseError);
		// 	res.end(parseError);
		// }
		cacheData.push(JSON.parse(req.rawBody));
		console.log('Received data: ' + (req.rawBody));


		return res.status(200).jsonp("Received data!");
		// res.end(JSON.stringify(reqBody,null,null,2));

	});

	// Assumes file will be stored in "file" param of request
	app.post('/uploadFile', function(req, res) {

		console.log('Request object keys: ' + Object.keys(req));
		// console.log('File received: ' + JSON.stringify(req.files.file));

		// Checking to see if there's any data
		// req.on('data', (data) => {
	  //   console.log('Data detected:\n' + data.toString());
	  // });

		// console.log('Request raw body files: ' + req.rawBody.files);

		var sampleFile;
		if (!req.files) {
			console.log('Request is missing the files parameter');
			// res.jsonp({"status":400, "error":"Request is missing files parameter"});
			return res.status(400);
		} else if (!req.files.file) {
			console.log('Required MultipartFile parameter \'file\' is not present.');
			return res.status(400).send('Required MultipartFile parameter \'file\' is not present.');
		} else {
			console.log('File looks okay!');
			testFile = req.files.file;
			testFile.mv(downloadPath +testFile.name, function(err) {
				if (err) {
					return res.status(500).send(err);
				} else {
					res.send(testFile.name + ' uploaded to ' + downloadPath);
				}
			});
		}
	});

	app.get('/dataReceived', (req, res) => {
		console.log('This is the cacheData: ' + JSON.stringify(cacheData));
		// res.send(cacheData);
		res.jsonp(cacheData);
	});

	app.all('*', function(req,res) {
		res.end('Hello Friend!');
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
