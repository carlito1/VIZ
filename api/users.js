var express = require('express');
var router = express.Router();

var gcm = require('../gcmSender');
var dataProvider = require('../dataProvider');
var jwt = require('jsonwebtoken');

var config = require('../config');


router.post('/Register', function(req, res){
	// Pridobimo podatke iz telesa zahteve
	var username = req.body.username;
	var password = req.body.password;

	// Vstavimo uporabnika v podatkovno bazo.
	dataProvider.insertNewUser(username,password, function(error){
		if(error){
			// V primeru napake pri vstavljanju
			// vrnemo status 500 in napako.
			return res.status(500).json(error);
		}
		else {
			// Vrnemo sporočilo o nastanku novega vira
			return res.status(201).end();
		}

	});
});

router.post('/LoginPhone', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	var idGCM = req.body.regId;

	console.log('Login phone');
	console.log(username, password, idGCM);
	dataProvider.getUserWithPassword(username,password,GetUser);

	function GetUser(error,data){
		console.log(data);
		if(error)
		{
			return res.status(500).json(error);
		} else if(!data){
			return res.status(404).end();
		} else 
		{
			dataProvider.updateUserGCM(username, idGCM, SetGCM);
		}
	}
	function SetGCM(error){
		if(error)
		{
			return res.status(500).json(error);
		} else {
			return res.status(200).end();
		}
	}
});

router.post('/Login', function(req, res){
	var username = req.body.username;
	var password = req.body.password;

	dataProvider.getUserWithPassword(username, password, GetUser);

	function GetUser(error,data){
		if(error){
			return res.status(500).json(error);
		}
		else {
			if(data){
				// Ustvarimo nov JWT z podatkom o uspešno kreiranem prvem koraku avtentifikacije
				// in uporabniškim imenom.
				// Uporabnik ima 5 min časa, da nadaljuje z avtentifikacijo.
				var token = jwt.sign({firstStep : true, user: { username: data.username}}, config.secret, {expiresInMinutes : 5});
				// TODO: send push notification
				console.log(data);
				gcm.sendPin(data.username,data.gcm_sender_id, function(){
					return res.status(200).json(token);
				});
				
			}
			else {
				return res.status(404).end();
			}
		}
	}
	

});

router.post('/LoginPin', function(req,res){
	var pin = req.body.pin;
	var jtwHeader = req.headers['authorization'].split(' ')[1];
    
    var decoded = jwt.verify(jtwHeader, config.secret);
   
	if(!decoded.firstStep){
		return res.status(500).end('Invalid token');
	} else {
		dataProvider.getUserPin(decoded.user.username,function(error,result){
			if(pin == result.last_pin)
			{

				console.log('Input pin',pin);
				console.log('actual pin', result.last_pin);
				var token = jwt.sign({authorized : true, user : decoded.user.username}, config.secret, {expiresInMinutes : 60});

				return res.status(200).json(token);
			} else {
				return res.status(401).end();
			}
			
		});
	}

});

module.exports = router;
