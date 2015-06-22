fast-image-downloader
==============

## Description
A fast and secure image downloader that relies on the first buffer bytes ("magic numbers") to determine file type. This module supports download timeouts, verifying HTTP status codes, and pre-defined allowed file types.

## Installation
```
npm install fast-image-downloader --save
```

## Usage
```
var fid = require('fast-image-downloader');

var TIMEOUT = 2000;	// timeout in ms
var ALLOWED_TYPES = ['jpg', 'png'];	// allowed image types
var REQ_OPTS = {strictSSL: false};	// Optional: Can be any valid options for the node request module

fid('http://example.com/image.jpg', TIMEOUT, ALLOWED_TYPES, REQ_OPTS, function(err, data){
	if (err) {
		// err will contain code, message, download time, file type (if known), and HTTP status code (if known)
		console.log(err.error);
	} else {
		// data will contain status code, file type (map of ext and mime), download time, and buffer body
		console.log(data.statusCode);

		// handle data.body buffer here...
	}
});

```

## Supported Types
The third argument, supported types, takes an array of image types (in extension code format). The following are supported types:

* jpg
* png
* gif
* webp
* tiff
* bmp

To allow all of the above, you can optionally pass in null or an empty array.

## Error Object
The error object contains the following:

```
{
	code: 1,
	error: 'Invalid file type',
	statusCode: null,
	fileType: null,
	time: 10
}
```

The ```statusCode``` and ```fileType``` properties may be null if the error was returned before these could be determined. For example, if the status code was 404, there is no need to determine the file type.

## Success Object
The success object contains the following:

```
{
	code: 0,
	statusCode: 200,
	fileType: {
		ext: 'jpg',
		mime: 'image/jpg'
	},
	time: 150,
	body: <Buffer ...>
}
```

## Testing
```
mocha --recursive tests/
```

To stress-test the module / your internet connection, run the stress.js file with node: ```node tests/stress.js```.