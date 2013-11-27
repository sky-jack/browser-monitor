#!/usr/bin/env node
	
(function() {
	var cli, gm, webdriver, options, assert, fs, browser, parseCommandLine, initParallelDevices, parseImages, diffImages, theDrivers;

	cli = require('commander');

	gm = require('gm');

	webdriver = require('wd-parallel-async')

	assert = require('assert');

	fs = require('fs');

	options = {};

	outputDir = process.cwd() + '/out/'

	parseCommandLine = function() {
		cli
			.option('-U, --urls <path>', 'path to JSON file specifying array of URLs to be used for screenshot generation')
			.option('-D, --drivers <path>', 'path to JSON file specifying array of configs for webdrivers/browsers for use with sauce labs')
			.parse(process.argv);
		console.log(cli.drivers);	

		if (cli.drivers) {
			theDrivers = JSON.parse(fs.readFileSync(cli.drivers));
		}
		console.log(theDrivers, "drivedat");

		var urls = [
			{ 
			  name: "nature",
			  url: "http://www.nature.com"
			},
			{
			  name: "nclimate",
			  url: "http://www.nature.com/nclimate"
			}
			
		];

		initParallelDevices(theDrivers, urls);
		   
	};

	writeScreenshot = function(data, name) {
		name = name || 'ss.jpg';
		fs.writeFileSync(outputDir + name, data, 'base64');
	};

	initParallelDevices = function (theDrivers, urls) {
		var username = "sky-jack",
			accessKey = "1fae4d98-5c98-4324-ac70-7dcb8fd766d6";

		var parallelizer = webdriver.parallelizer({
			host: "ondemand.saucelabs.com", 
			port: 80, 
			username: username,
			accessKey: accessKey
		});

		parallelizer.run(theDrivers, function(browser, desired) {

			browser.on('status', function(info){
				console.log('\x1b[36m%s\x1b[0m', info);
			});
			
			browser.on('command', function(meth, path){
				console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
			});
			
			browser.init(desired, function() {
				console.log(urls);

				urls.forEach(function(durl) {
					var groupName = durl.name;
					if(fs.exists(outputDir + groupName) !== true) {
						fs.mkdirSync(outputDir + groupName);
					}
					browser.get(durl.url, function() {
						browser.takeScreenshot(function(err, data) {
							console.log(groupName +'/'+ desired.name + '.jpg')

							writeScreenshot(data, groupName +'/'+ desired.name + '.jpg'); 
						})
					});
				});

				
				
			})
		});
	};
	parseImages = function () {
		fs.readdir(outputDir, function (err, files) {
			if (err) {
				console.log(err);
				
			}
			//diffImages(files.filter(function (child) {
    		//	return child.indexOf('.') !== 0;
			//}));
		});
	};

	diffImages = function (imageArray) {
		imageArray.forEach(function (index) {
			console.log(index, "index");
			imageArray.forEach(function (jindex) {
				if (index !== jindex) {
					gm.compare(outputDir + index, outputDir + jindex, 0.02, function (err, isEqual, equality, raw) {
					  if (err) throw err;
					  console.log('The images are equal: %s', isEqual);
					  console.log('Actual equality: %d', equality)
					  console.log('Raw output was: %j', raw);
					});
				}
			})
		});
	};
	//parseImages();
	//diffImages();
	parseCommandLine();


}).call(this);