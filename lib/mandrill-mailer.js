(function () {

	var mandrill = require('mandrill-api/mandrill');

	var async = require('async');

	var fs = require('fs');

	var mandrill_client = new mandrill.Mandrill('ZCzvElTkFKu5ItzpFodS1Q');

	var	mailUser = function (recipient, results) {

		var resultsString = "There is a problem the screenshots from the following devices are not equal to others in the group \n";

		if (results) {
			var recipient = recipient || "feds@nature.com";
			var	ImageArray = [];

			results.forEach(function(result) {
				console.log(result);
				resultsString += "The attached image is unequal with others in the group \n" + result.equality;

				var imageObject = {
						"type" : "image/jpg",
						"name": result.img.comparisonitem,
				};

    			var base64Image = fs.readFileSync(result.img.comparisonitem).toString('base64');
    			var decodedImage = new Buffer(base64Image, 'base64');
				imageObject.content = base64Image;
				ImageArray.push(imageObject);

			});

			var	message = {
			    "text":  resultsString,

			    "subject": "FEDS, we have a problem",
			    "from_email": "j.watkins@nature.com",
			    "from_name": "Browser Monitor",
				"to" : [{
							"email": recipient,
			            	"type": "to",
			            	"name": "jack"
			        	}],
			    "headers": {
			        "Reply-To": "message.reply@example.com"
			    },
			    "important": false,
			
			    "attachments": ImageArray
			};

			var async = false;
			var ip_pool = "Main Pool";
			var date =  new Date();
			var send_at = date.toUTCString();
			
			mandrill_client.messages.send({"message": message, "async": false, "ip_pool": ip_pool }, function(results) {
			    
			   
			}, function (e) {
			    // Mandrill returns the error as an object with name and message keys
			    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
			    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
			});
		} else {

			console.log('no results returned');
		};
	};

	module.exports = {
   		mailUser: mailUser
    };


}).call(this);