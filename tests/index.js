var assert = require('assert');
var downloader = require(__dirname + '/../index.js');
var TIMEOUT = 30000;
var GOOD_JPG = 'http://upload.wikimedia.org/wikipedia/commons/3/30/STSCPanel.jpg';

describe('Download an available image', function() {
	this.timeout(TIMEOUT);

	it('should return a 200', function(done) {

		downloader(GOOD_JPG, 20000, ['jpg'], function(err, result){
			assert(result.code === 0, 'Code was not 0');
			assert(result.statusCode === 200, 'Status code was not 200');
			assert(result.time && result.time > 0, 'Time was not greater than 0');
			assert(result.fileType && result.fileType.ext === 'jpg', 'File type extension was not jpg');
			assert(Buffer.isBuffer(result.body), 'Body was not a buffer');
			done();
		});
	});

	it('should return a timeout error with low timeout', function(done) {

		downloader(GOOD_JPG, 10, ['jpg'], function(err, result){
			assert(err.code === 4, 'Code was not 4');
			assert(!err.statusCode, 'Status code was not null');
			assert(err.time && err.time > 0, 'Time was not greater than 0');
			assert(!err.fileType, 'File type was not null');
			done();
		});
	});

	it('should return a invalid image type error', function(done) {

		downloader(GOOD_JPG, 20000, ['gif'], function(err, result){
			assert(err.code === 1, 'Code was not 1');
			assert(err.statusCode === 200, 'Status code was not 200');
			assert(err.time && err.time > 0, 'Time was not greater than 0');
			assert(err.fileType && err.fileType.ext === 'jpg', 'File type extension was not jpg');
			done();
		});
	});
});