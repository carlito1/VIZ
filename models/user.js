var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	username: { type: String, required : true},
	password : {type: String, required : true},

	gcm_id : {type: String},
	pin : {type: Number}
});

module.exports = mongoose.Model('users', userSchema);