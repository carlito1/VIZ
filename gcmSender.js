// GCM sender
var gcm = require('node-gcm');

var message = new gcm.Message();
var config = require('./config');

var sendPin = function(regId,callback){
	// Read last pin from database
	message.addData('pin','1234');

	var regIds = [regId];

	var sender = new gcm.Sender(config.apiKey)

	// Create new pin, and save it to database
	sender.send(message, regIds, function(err,result){
		if(err) console.log('Error after sending gcm msg: ' + err);

		else console.log('Result after sending gcm msg: ' + result);

		callback();
	});
};


function CreateNewPin()
{
	var max = 9999;
	var min = 1000;
	return Math.floor(Math.random()*(max-min+1)+min);
}
module.exports.sendPin = sendPin;