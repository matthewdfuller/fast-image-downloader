var request = require('request');

var codes = {
	0: 'Okay',
	1: 'Invalid file type',
	2: 'Error HTTP response code',
	3: 'Error during download',
	4: 'Timeout exceeded',
	5: 'Invalid URL protocol',
	6: 'Unknown error'
};

function loadImage(url, timeout, types, callback) {
	var chunks = [];
	var statusCode;
	var fileType;
	var finished = false;
	var returnFinished = function() { return finished; }

	try {
		var start = new Date();
		var r = request.get(url, {encoding:null})
				.on('data', function(chunk){
					if (!chunks.length) {
						fileType = checkBufferMimeType(chunk);
						if (!fileType || (types && types.length && types.indexOf(fileType.ext) === -1)){
							return finishDownload(1);
						}
					}
					chunks.push(chunk);
				})
				.on('response', function(response){
					statusCode = response.statusCode;
					if (['2', '3'].indexOf(statusCode.toString().substring(0,1)) === -1) {
						finishDownload(2);
					}
				})
				.on('end', function(){
					finishDownload();
				})
				.on('error', function(error){
					finishDownload(3);
				});
		var expire = setTimeout(function(){
			if (!returnFinished()) {
				r.abort();
				finishDownload(4);
			}
		},timeout);

		function finishDownload(abort) {
			if (!finished) {
				finished = true;
				clearTimeout(expire);
				if (abort) {
					r.abort();
					return callback({
						code: abort,
						error: codes[abort],
						statusCode: statusCode || null,	// might be undefined
						fileType: fileType || null,		// might be undefined
						time: new Date() - start
					});
				}

				var body = Buffer.concat(chunks);
				callback(null, {
					code: 0,
					statusCode: statusCode,
					fileType: fileType,
					time: new Date() - start,
					body: body
				});
			}
		}
	} catch (e) {
		if (!finished) {
			finished = true;
			// Request will throw an error if the protocol is invalid (doesn't use proper callback)
			if (e.toString().indexOf('Invalid protocol') !== -1){
				return callback({
					error: 5,
					statusCode: statusCode,
					fileType: fileType,
					time: new Date() - start
				});
			}
			callback({
				error: 6,
				statusCode: statusCode,
				fileType: fileType,
				time: new Date() - start
			});
		}
	}
}

function checkBufferMimeType(buffer) {
	// Copyright @sindresorhus: https://github.com/sindresorhus/file-type/blob/master/index.js

	if (!(buffer && buffer.length > 1)) {
		return null;
	}

	if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
		return {
			ext: 'jpg',
			mime: 'image/jpeg'
		};
	}

	if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
		return {
			ext: 'png',
			mime: 'image/png'
		};
	}

	if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
		return {
			ext: 'gif',
			mime: 'image/gif'
		};
	}

	if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
		return {
			ext: 'webp',
			mime: 'image/webp'
		};
	}

	if ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x0) || (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x0 && buffer[3] === 0x2A)) {
		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
		return {
			ext: 'bmp',
			mime: 'image/bmp'
		};
	}

	return null;
}

module.exports = loadImage;