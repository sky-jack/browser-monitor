(function () {

	var fs = require('fs');

	var gm = require('gm');

	var	async = require('async');



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

	var diffImages = function (imageArray, outputDir, callback) {
		var results = {};
		results.text = "";
		result.imgs = {};
		async.forEachSeries(imageArray,function(item, cbloop1) {
			async.forEachSeries(imageArray,function(jitem, cbloop2) {
				
				gm.compare(jitem, item, 0.1, function (err, isEqual, equality, raw) {

					if (err) throw err;
					if(isEqual != true) {
						results += 'The images are equal: %s' + isEqual + '/n';
						results += jitem + '/n' + item + " unacceptable quality " + equality;


						console.log('The images are equal: %s',  + isEqual);
						console.log(jitem, item, ' unacceptable equality: %d', equality);
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