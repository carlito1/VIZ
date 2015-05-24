var express = require('express');
var router = express.Router();
var path = require('path');
var jwt = require('jsonwebtoken');

var config = require('../config');

router.use('/', function(req,res,next){
    var jtwHeader = req.headers['authorization'].split(' ')[1];
    var decoded = jwt.verify(jtwHeader, config.secret);
    if(decoded.authorized)
    {
    	return next();
    } else 
    {
    	return res.status(401).end();
    }
});

router.get('/secret', function(req,res){
	res.sendFile(path.join(__dirname + '/secret_partial.html'));
});

module.exports = router;