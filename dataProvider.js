var config = require('./config');
var mysql = require('mysql');
var connection = mysql.createConnection({
	host : config.host,
	user : config.user,
	password : config.password,
	database : config.database
});


var insertNewUser = function(username, password, callback){
	console.log('Inside insert new user');
	console.log(username);
	console.log(password)
	connection.query('INSERT INTO user(username,password) VALUES (' + connection.escape(username) + ', ' +
		connection.escape(password)+')', function(error, result){

			if(error)
			{
				console.log(error);
				console.log('End insert new user');
				return callback(error);
			}
			else
			{
				console.log('End insert new user');
				return callback(null);
			}
	});
};

var updateUserGCM = function(username, gcm_id, callback){
	connection.query('UPDATE user SET gcm_sender_id = ' + connection.escape(gcm_id) + ' WHERE username = ' + connection.escape(username),function(error,result){
		if(error)
		{
			return callback(error);
		}
		else
		{
			return callback(null);
		}
	});
}

var updateUserPin = function(username, pin, callback){
	connection.query('UPDATE user SET last_pin = ' + connection.escape(pin) + ' WHERE username = ' + connection.escape(username),function(error,result){
		if(error)
		{
			return callback(error);
		}
		else
		{
			return callback(null);
		}
	});
}

var getUserWithPassword = function(username, password,callback){
	connection.query('SELECT * from user WHERE username = ' + connection.escape(username) 
		+ ' AND password = ' + connection.escape(password), function(error,result){
			if(error){
				return callback(error);
			} else {
				console.log(result);
				return callback(null,result[0]);
			}
		});
}
var getUserGCM = function(username, callback){
	connection.query('SELECT gcm_id from user WHERE username = ' + connection.escape(username) , function(error,result){
			if(error){
				return callback(error);
			} else {
				return callback(null,result[0]);
			}
		});
}
var getUserPin = function(username, callback)
{
	connection.query('SELECT last_pin from user WHERE username = ' + connection.escape(username) , function(error,result){
			if(error){
				return callback(error);
			} else {
				return callback(null,result[0]);
			}
		});
}

module.exports.insertNewUser = insertNewUser;
module.exports.updateUserGCM = updateUserGCM;
module.exports.updateUserPin = updateUserPin;
module.exports.getUserWithPassword = getUserWithPassword;
module.exports.getUserGCM = getUserGCM;
module.exports.getUserPin = getUserPin;