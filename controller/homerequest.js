var express = require('express')
var app = express()
var router = express.Router()
var CryptoJS = require("crypto-js")
var md5 = require('md5') // su dung md5 ma hoa pass

router.route('/home')
.get(function(req, res){
	
	res.render('ejs/homepage')
})

module.exports = router;