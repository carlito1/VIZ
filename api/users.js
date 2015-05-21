var express = require('express');
var router = express.Router();

var db = require('../mongoConnection');
var gcm = require('../gcmSender');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/Register', function(req, res){
	req.body.username;
	req.body.password;
});

router.post('/Login', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var gcm_id = req.body.gcm_id;

	var user = {};
	user.username = username;
	user.password = password;
	user.gcm_id = gcm_id;
	db.InsertNewUser(user,function(error){
		if(error)
		{
			return res.status(500);
		}
		else
		{
			gcm.sendPin(user.gcm_id);
			return res.status(201);
		}

	});

});

router.post('/',function(req,res){
	// GCM push, to create pin

});

router.post('/LoginPin', function(req,res){

});

module.exports = router;
