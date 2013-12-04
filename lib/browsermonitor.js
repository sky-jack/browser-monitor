#!/usr/bin/env node
	
(function() {
	var cli, differ, webdriver, options, async, assert, events, browser, parseCommandLine, getGroup, mandrill, mandrill_client, initParallelDevices, parseImages, diffImages, theDrivers, urls, mailUser;

	cli = require('commander');

	events = require('events');

	differ = require('./image-differ.js');

	webdriver = require('wd-parallel-async');

	mandrill = require('mandrill-api/mandrill');

	assert = require('assert');

	fs = require('fs');

	options = {};

	async = require('async');
	
	outputDir = process.cwd() + '/out/';



	parseCommandLine = function() {
		cli
			.option('-U, --urls <path>', 'path to JSON file specifying array of URLs to be used for screenshot generation')
			.option('-D, --drivers <path>', 'path to JSON file specifying array of configs for webdrivers/browsers for use with sauce labs')
			.parse(process.argv);

		if (cli.drivers) {
			theDrivers = JSON.parse(fs.readFileSync(cli.drivers));
		};
		if (cli.urls) {
			urls = JSON.parse(fs.readFileSync(cli.urls))
		};
		initParallelDevices(theDrivers, urls);
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
			
			browser.on('command', function(meth, path){
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
		async.forEachSeries(urls,function(theurl, cbloop) {
			var groupPath = outputDir + theurl.name + '/';
			differ.parseImages(groupPath, function(data) {
				differ.diffImages(data, groupPath);
			});
			cbloop()
		}, function () {console.log('diff complete')});
	};


	mailUser = function (recipients) {
		var message;
		mandrill_client = new mandrill.Mandrill('ZCzvElTkFKu5ItzpFodS1Q');

		recipients.foreach(function(recipient) {
			message = {
			    "text": "Example text content",
			    "subject": "example subject",
			    "from_email": "j.watkins@nature.com",
			    "from_name": "Browser Monitor",
			    "to": [{
			            "email": recipient.email,
			            "type": "to"
			        }],
			    "headers": {
			        "Reply-To": "message.reply@example.com"
			    },
			    "important": false,
			
			    "images": [{
			            "type": "image/png",
			            "name": "IMAGECID",
			            "content": "ZXhhbXBsZSBmaWxl"
			        }]
			};
			var async = false;
			var ip_pool = "Main Pool";
			var send_at = "example send_at";
			mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
			    console.log(result);
			}, function(e) {
			    // Mandrill returns the error as an object with name and message keys
			    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
			    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
			});
		});
	};
	mailUser();
	//parseCommandLine();
	
}).call(this);