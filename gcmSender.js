// GCM sender
var gcm = require('node-gcm');

var message = new gcm.Message();
var config = require('./config');
var dataProvider = require('./dataProvider');

var sendPin = function(username,regId,callback){
	// Read last pin from database
	CreateNewPin(username, function(error){
		if(error)
			return callback(error);
		else {

			dataProvider.getUserPin(username, function(error,data){
				if(error)
					return callback(error);
				else
				{
					message.addData('pin',data.last_pin);
					var regIds = [regId];
					var sender = new gcm.Sender(config.apiKey)

					// Create new pin, and save it to database
					sender.send(message, regIds, function(err,result){
						if(err) console.log('Error after sending gcm msg: ' + err);

						else console.log('Result after sending gcm msg: ' + result);

						callback(err);
					});
				}
				
			});
		}
	});
	

	
};


function CreateNewPin(username,callback)
{
	
	var max = 9999;
	var min = 1000;
	var pin = Math.floor(Math.random()*(max-min+1)+min);

	dataProvider.updateUserPin(username,pin, function(error){
		if(error)
		{
			return callback(error);
		} else callback(null);
	});
}
module.exports.sendPin = sendPin;