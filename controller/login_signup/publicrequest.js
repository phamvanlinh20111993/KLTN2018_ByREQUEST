var express = require('express')
var app = express()
var router = express.Router()
var state = -1;
var md5 = require('md5') // su dung md5 ma hoa pass
var fs = require('fs');
var path = require('path')
var CryptoJS = require("crypto-js")
var libfunction = require('../../local_modules/customfunction')
var workfile = require('../../local_modules/workwithfile')
var querysimple = require('../../model/QuerysingletableSimple')

function Error(id){
	var errstr = "";
	switch(id)
	{
		case md5(0): 
			errstr = "Fail to authentication user.Please back to page and login again."
			break;

		case md5(1):
			errstr = "This file is not a image file or not application/image. Using valid image file."
			break;

		case md5(2):
			errstr = "Failed to sign in with facebook account."
			break;

		case md5(3):
			errstr = "Failed to sign in with google account."
			break;

		case md5(4):
			errstr = "Failed to change password."
			break;

		case md5(5):
			errstr = "This account was logged in.Failed to sign in with facebook account."
			break;

		case md5(6):
			errstr = "This account was logged in.Failed to sign in with google account."
			break;

		case md5(7):
			errstr = "This account does not exist.Please try again."
			break;

		case md5(30):
			//truy van csdl
		default:
		    errstr = "Not valid code.Or something wrong.:((((("
		    break;
	}
	return errstr;
}

router.route('/user')
 .get(function(req, res)
{	
	var errid = req.query.errid;
	if(req.cookies.CeE7_z1ws)
	{
		var bytes  = CryptoJS.AES.decrypt(req.cookies.CeE7_z1ws, "20111993");
		var bytes1 = CryptoJS.AES.decrypt(req.cookies.Coie_ccd4, "20111993");
		var emailuser = bytes.toString(CryptoJS.enc.Utf8);//chuỗi string
		var passuser = bytes1.toString(CryptoJS.enc.Utf8);

		querysimple.selectTable("User", ["id", "password", "stay"], [{op:"", field: "email", value: emailuser}],
			null, null, null, function(result, field, err)
		{
			if(err) throw err

			var bytes  = CryptoJS.AES.decrypt(result[0].password, md5(passuser));
			var deemail = bytes.toString(CryptoJS.enc.Utf8);
			if(deemail.toString() == emailuser.toString() && result[0].stay == 1){//chua logout bao gio
				req.session.user_id = result[0].id
				req.session.password = result[0].password
				req.session.email = deemail
				res.redirect('/languageex/user/filter')
			}else
				res.render('ejs/Login', {email: emailuser, pass:passuser })
		})
	}else if(typeof errid != 'undefined'){	
		state = 2;
		res.render('ejs/login', {state: state})
	}else
		res.render('ejs/Login')

})

 router.route('/user/login')
 .get(function(req, res)
{	
	state = 1;
	if(req.cookies.CeE7_z1ws){
		var bytes  = CryptoJS.AES.decrypt(req.cookies.CeE7_z1ws, "20111993");
		var bytes1 = CryptoJS.AES.decrypt(req.cookies.Coie_ccd4, "20111993");
		var emailuser = bytes.toString(CryptoJS.enc.Utf8);//chuỗi string
		var passuser = bytes1.toString(CryptoJS.enc.Utf8);

		querysimple.selectTable("User", ["id", "password", "stay"], [{op:"", field: "email", value: emailuser}],
			null, null, null, function(result, field, err)
		{
			if(err) throw err

			var bytes  = CryptoJS.AES.decrypt(result[0].password, md5(passuser));
			var deemail = bytes.toString(CryptoJS.enc.Utf8);

			if(deemail.toString() == emailuser.toString() && result[0].stay == 1){//chua logout bao gio
				req.session.user_id = result[0].id
				req.session.password = result[0].password
				req.session.email = deemail
				res.redirect('/languageex/user/filter')
			}else
				res.render('ejs/Login', { state: state, email: emailuser, pass:passuser })
		})

	}else
		res.render('ejs/Login', { state: state })
})

router.route('/user/signup')
 .get(function(req, res)
{	
	if(req.session.signupemail)
	{
		var email = req.session.signupemail
		req.session.signupemail = null;
		delete req.session.signupemail
		res.render('ejs/Signup', {emailsg: email})
	}else
		res.render('ejs/Signup')
})

 router.route('/user/error')
 .get(function(req, res)
{	
	
	var id = req.query.err
	var err = {
		id: id,
		content: Error(id)
	}

	res.render('ejs/Error', {err: err})
})
 .post(function(req, res)
{	
	res.render('ejs/Error')
})

 router.route('/user/logout')
 .get(function(req, res)
{	
	if(req.session.filter){
		querysimple.updateTable("User", [{field: "state", value: 0}, {field: "stay", value: 0}], 
			[{op:"", field: "id", value: parseInt(req.session.user_id)}], function(result, err){
				if(err) throw err;
				req.session.destroy()
				console.log(result.affectedRows + " record(s) updated")
				res.redirect('/languageex/user')
		})
	}else
		res.redirect('/languageex/user')
})
 .post(function(req, res)
{	
	if(req.session.user_id){
		querysimple.updateTable("User", [{field: "state", value: 1},  {field: "stay", value: 1}], 
			[{op:"", field: "id", value: parseInt(req.session.user_id)}], function(result, err){
				if(err) throw err;
				console.log(result.affectedRows + " record(s) updated")
				req.session.destroy()
				res.redirect('/languageex/user')
		})
	}else
		res.redirect('/languageex/user')
})

router.route('/')
 .get(function(req, res)
{	
	res.redirect('/languageex/user')
})
 .post(function(req, res)
{	
	res.redirect('/languageex/user')
})

 //profile
 router.route('/user/profile')
 .get(function(req, res)
 {
 	var userid = null
 	if(typeof req.query.uid != 'undefined')
 		userid = req.query.uid
   
 	if(userid && req.session.user_id){
 		//check database, escape sql injection..
 		querysimple.selectTable("User", ["id"], [{op:"", field: "id", value: userid}], null, null, null,
 			function(result, fields, err){
 				if(err) throw err
 			if(result.length > 0){
 				querysimple.selectProfile(userid, function(result, fields, err){
 					if(err) throw err
 					else{
 						var User = result
 						if(userid == req.session.user_id)
 							User.state = "me"
 						else
 							User.state = "something"
 						res.render('ejs/Profile', {User: User})
 					}
 				})
 			}else{
 				var err = {}
 				err.redirect = "/languageex/home"
 				err.title = "Sorry, this content isn't available right now"
 				err.code = "#1232"
 				err.content = "The link you followed may have expired, or the page may only be visible to an audience you're not in."
 				res.render('ejs/Profile', {err: err})
 			}
 		})
 	}else{
 		var err = {}
 		err.redirect = "/languageex/home"
 		err.note = "Take me Home"
 		res.render('html/Notfound.html', {err: err})
 	}
 })


router.route('/messenger')
.get(function(req, res){

	var userid = null
 	if(typeof req.query.uid != 'undefined')
 		userid = req.query.uid

	if(req.session.user_id){
		//check database, escape sql injection..
 		var User = {}

		if(userid){
			//search contact
			res.render('ejs/messenger.ejs', {User: User})
		}else
 			res.render('ejs/messenger.ejs', {User: User})
 	}else
 		res.render('html/Notfound.html')
})


 router.route('/user/uploadphoto')
.post(function(req, res){

   if(req.session && req.session.user_id)
   {
      var base64Data = req.body.upload_photo_image.replace(/^data:image\/png;base64,/, "");
      var dirname = path.resolve(__dirname, "../..") + "/public/data/img/";
      
      console.log(dirname)
      workfile.Delete_file_in_directory(dirname, req.session.user_id)//delete old file

      workfile.Create_directory(dirname, req.session.user_id, function(data, err){
      	if(err)
      		throw err

      	console.log(data)

      	var imagename = libfunction.makeEmailid()
      	var pathsave = dirname + '/' + req.session.user_id + '/' + imagename  + ".png"

      	fs.writeFile(pathsave, base64Data, 'base64', function(err){
         	if(err)
            	throw err

        	//check file
        	const readChunk = require('read-chunk');
        	const buffer = readChunk.sync(pathsave, 0, 4100);
        	const fileType = require('file-type');

        	console.log(fileType(buffer).ext + "   " + fileType(buffer))
        	console.log(libfunction.typeFile(fileType(buffer).ext))

        	if(libfunction.typeFile(fileType(buffer).ext)){
            	//create session
            	req.session.photo = "/data/img/" + req.session.user_id + '/' + imagename + ".png"
            	//save in database
            	querysimple.updateTable("User", [{field: "photo", value: req.session.photo}],
            		[{op:"", field: "id", value: req.session.user_id}], function(result, err){
            			if (err) throw err;
            			else console.log(result.affectedRows + " record(s) updated.")
            		})
            	
        	}else{
            	fs.unlink(pathsave)
            	res.redirect('/languageex/user/error?err='+encodeURIComponent(md5(1)))   
        	}

         	res.send(JSON.stringify("/public/data/img/" + md5(req.session.user_id)))
      	});

      })
   }
})


module.exports = router;