if (process.argv.join('').indexOf('mocha') > -1) { return; }	// Don't run via mocha

var async = require('async');
var urls = require(__dirname + '/urls.json');
var downloader = require(__dirname + '/../index.js');

var ALLOWED_TYPES = ['png', 'gif'];

async.eachLimit(urls, 5, function(url, callback){
	console.log('Downloading: ' + url);
	downloader(url, 2000, ALLOWED_TYPES, function(err, data){
		if (err) {
			console.log(err);
		} else {
			console.log(data.statusCode);
		}
		callback();
	});
}, function(err){
	console.log(err);
});