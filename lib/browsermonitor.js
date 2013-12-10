#!/usr/bin/env node
	
(function() {
	var cli, differ, webdriver, options, async, assert, events, browser, parseCommandLine, getGroup, initParallelDevices, parseImages, diffImages, theDrivers, urls, mailUser, theResults;

	cli = require('commander');

	events = require('events');

	differ = require('./image-differ.js');

	mailer = require('./mandrill-mailer.js');

	webdriver = require('wd-parallel-async');

	assert = require('assert');

	fs = require('fs');

	options = {};

	async = require('async');
	
	outputDir = process.cwd() + '/out/';

	theResults = [];


	parseCommandLine = function() {
		cli
			.option('-U, --urls <path>', 'path to JSON file specifying array of URLs to be used for screenshot generation')
			.option('-D, --drivers <path>', 'path to JSON file specifying array of configs for webdrivers/browsers for use with sauce labs')
			.option('-R, --recipients <path>', 'path to JSON file specifying an  array of emails to notify if screenshots do not compare')
			.parse(process.argv);

		if (cli.drivers) {
			theDrivers = JSON.parse(fs.readFileSync(cli.drivers));
		};
		if (cli.urls) {
			urls = JSON.parse(fs.readFileSync(cli.urls));
		};
		if (cli.recipients) { 
			recipients = JSON.parse(fs.readFileSync(cli.recipients));
		};

		initDiffer(urls, outputDir);
		//initParallelDevices(theDrivers, urls);
	};

	writeScreenshot = function(data, name, callback) {
		name = name || 'ss.jpg';
		console.log(name);
		fs.writeFileSync(name, data, 'base64');
		callback();
	};

	getGroup = function (groupName) {
			var groupPath = outputDir + groupName;
			if(fs.existsSync(groupPath) !== true) {
				fs.mkdirSync(groupPath);
				return groupPath
			} else {
				return groupPath
			}
	}

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
			
			browser.on('command', function(meth, path) {
				console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path);
			});
			
			browser.init(desired, function() {
				async.forEachSeries(urls, function(item, theCallback) {
					console.log(item.name);
					browser.get(item.url);
					var groupPath = getGroup(item.name);

					setTimeout(function () {
						browser.takeScreenshot(function(err, data) {
							if (err) throw err;
								writeScreenshot(data, groupPath +'/'+ desired.name + '.jpg', function () {
								theCallback();
							});
						});
					}, 3000);
					
				}, function () {
					console.log('browsers snapped');
					browser.quit();
				});
			});
		});

		parallelizer.on('end', function() {
			initDiffer(urls, outputDir);
  		});
		
	
	
	};
	initDiffer = function (urls, outputDir) {
		async.forEachSeries(urls,function(theurl, thecb) {
			var groupPath = outputDir + theurl.name + '/';
			differ.parseImages(groupPath, function(data) {
				differ.diffImages(data, groupPath, function(results) {
					theResults.push(results);
					thecb();
				});
			});
			
		}, function () {
			mailer.mailUser(recipients, theResults);
		});
	};
	parseCommandLine();
	
}).call(this);