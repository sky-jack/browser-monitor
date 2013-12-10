(function () {

	var mandrill = require('mandrill-api/mandrill');

	var async = require('async');

	var mandrill_client = new mandrill.Mandrill('ZCzvElTkFKu5ItzpFodS1Q');

	var	mailUser = function (recipients, results) {

		if (results) {
			var	message = {
			    "text": "We have a problem " + results,
			    "subject": "FEDS, we have a problem",
			    "from_email": "j.watkins@nature.com",
			    "from_name": "Browser Monitor",
				"to" : [{
							"email": "j.watkins@nature.com",
			            	"type": "to",
			            	"name": "jack"
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