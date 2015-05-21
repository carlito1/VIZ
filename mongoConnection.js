var mongoose = require('mongoose');

var connectionString = require('./config.json').connectionString;

mongoose.connect(connectionString);
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

db.once('open', function (callback) {
    console.log("Connection established");
});

var user = require('./models/user');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = require('./config.json').key;


var InsertNewUser = function(user, callback){
	var newUser = new user(user);

	newUser.save(function(error){
		if(error)
		{
			return callback(error);
		}
		else
		{
			return callback(null);
		}
	});
};
var SetUserGcm = function (username, gmc_id,callback){
	user.findByIdAndUpdate({username : username}, {gmc_id: gmc_id}, function(err,data){
		if(err)
		{
			console.log('error while trying to update userId', err);
			callback(err,null);
		} else
		{
			callback(null, data);
		}
	} );
};

var SetUserPin = function (pin, callback){

};

var GetUser = function (username, callback){

};

var GetUserWithPassword = function(username, password, callback)
{
	user.findOne({ $and : [{ username : username }, { password: password }] }, function(error, data){
		if(error)
		{
			console.log('Error while trying to get user with password');
			callback(error);
		}
		else
		{
			callback(null,data);
		}
	});
};


module.exports.InsertNew = InsertNewUser;
module.exports.SetUserGcm = SetUserGcm;
module.exports.SetUserPin = SetUserPin;
module.exports.GetUser = GetUser;
module.expors.GetUserWithPassword = GetUserWithPassword;
