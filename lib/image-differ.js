(function () {

	var fs = require('fs');

	var gm = require('gm');

	var	async = require('async');


	/* accepts path to output directory and returns a filtered array of the directories contents */

	var parseImages = function (outputDir, callBack) {
		fs.readdir(outputDir, function (err, files) {
			if (err) {
				console.log(err);
			}
			var filtered = files.filter(function(item) {
				return item.indexOf('.') !== 0
			});

			return callBack(filtered.map(function (item) {
				return outputDir + item;
			}));
		});
	};

	/* accepts an array of images the full path to the output directory and a callback  matches each image within the directory 
	to one another with graphicsMagick and returns an array of results which do not match */

	var diffImages = function (imageArray, outputDir, callback) {
		async.forEachSeries(imageArray,function(item, cbloop1) {
			async.forEachSeries(imageArray,function(jitem, cbloop2) {
				gm.compare(jitem, item, 0.1, function (err, isEqual, equality, raw) {

					if (err) throw err;
					if(isEqual != true) {
						results = {};
						results.text = "";
						results.img = {'itemname' : jitem, 'comparisonitem' : item };
						results.isEqual = isEqual;
						results.equality = equality;
						results.text += 'The images are equal: ' + isEqual + '/n';
						results.text += jitem + '/n' + item + " unacceptable quality: " + equality;

					};
					cbloop2();
					
				});	

			}, function() { cbloop1();})
			

			},function() {
				
				callback(results);
		
			});

	};

	module.exports = {
   		parseImages: parseImages,
    	diffImages: diffImages
    };
}).call(this);