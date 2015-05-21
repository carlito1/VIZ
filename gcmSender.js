// GCM sender
var gcm = require('node-gcm');

var message = new gcm.Message();
var config = require('./config');

var sendPin = function(regId){
	// Create pin and save it to db.
	message.addData('pin','1234');

	var regIds = [reqId];

	var sender = new gcm.Sender(config.apiKey)

	sender.send(message, reqId, function(err,result){
		if(err) console.log('Error after sending gcm msg: ' + err);

		else console.log('Result after sending gcm msg: ' + result);
	});
};

module.exports.sendPin = sendPin;