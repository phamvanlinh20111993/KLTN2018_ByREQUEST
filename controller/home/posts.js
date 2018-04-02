var express = require('express')
var app = express()
var router = express.Router()
var CryptoJS = require("crypto-js")
var md5 = require('md5') // su dung md5 ma hoa pass
var postcomment = require('../../model/post_comments_query')
var querysimple = require('../../model/QuerysingletableSimple')
var anotherquery = require('../../model/Anotherquery')



function createSession(req, res, emailuser, passuser){
	querysimple.selectTable("User", ["password", "stay"], [{op:"", field: "email", value: emailuser}],
		null, null, null, function(result, field, err)
		{
			if(err) throw err

			var bytes  = CryptoJS.AES.decrypt(result[0].password, md5(passuser));
			var deemail = bytes.toString(CryptoJS.enc.Utf8);

			if(deemail.toString() == emailuser.toString() && result[0].stay == 1){//chua logout bao gio
				querysimple.selectUser(emailuser, function(result, fields, err){
					if(err) throw err;
					else{
						req.session.user_id = result[0].id
						req.session.email = result[0].email
						req.session.password = result[0].password
						req.session.photo = result[0].photo

						anotherquery.select_max_prio_Ex_and_Navtive(result[0].id, function(data){
							req.session.mynative = data[0].natsy
							req.session.myexchange = data[0].exsy
							res.render('ejs/discussion', {user: result})
						})
					}
				})
			}else
				res.redirect('/languageex/user/login')
	})

}


router.route('/user/post')
.get(function(req, res){
	//take id
	if(req.session.user_id){
		var post_id = req.query.pid

		if(typeof post_id != 'undefined'){

		}else{
			querysimple.selectUser(req.session.email, function(result, fields, err){
				if(err) throw err
				else res.render('ejs/discussion', {user: result})
			})
		}
		
	}else{//khong ton tai phien lam viec

		if(req.cookies.CeE7_z1ws){
			var bytes  = CryptoJS.AES.decrypt(req.cookies.CeE7_z1ws, "20111993");
			var bytes1 = CryptoJS.AES.decrypt(req.cookies.Coie_ccd4, "20111993");
			var emailuser = bytes.toString(CryptoJS.enc.Utf8);//chuỗi string
			var passuser = bytes1.toString(CryptoJS.enc.Utf8);

			if(!req.session.filter){
				//fitle nguoi dung
				querysimple.selectTable("blocklist_admin", ["blockwho"],
   					[{op:"", field: "blockwho", value: emailuser}], null, null, null, function(result, fields, err){
   					if(err)  throw err;
   					if(result.length > 0){
						res.redirect('/languageex/user/error?err='+encodeURIComponent(md5(62)))
					}else{
						req.session.filter = true;
						createSession(req, res, emailuser, passuser)
					}
   				})
			}else
				createSession(req, res, emailuser, passuser)
	    }else{
	    	res.redirect('/languageex/user/login')
	    }
	}
	
})
.post(function(req, res){
	if(req.session.user_id){
		//do something
		querysimple.selectUser(req.session.email, function(result, fields, err){
			if(err) throw err
			else
				res.render('ejs/discussion', {user: result})
		})
		
	}
})



router.route('/user/loadtitle')
.post(function(req, res){

	if(req.session.user_id){
		querysimple.selectTable("post_title", ["id", "name", "code"], null, null, null, null,
			function(result, fields, err){
			if(err) throw err;
			else
				res.json({data: result})
		})
	}
})


router.route('/user/loadpost')
.post(function(req, res){

	if(req.session.user_id){

	}
})

router.route('/user/loadmypost')
.post(function(req, res){

	if(req.session.user_id){
		postcomment.selectMyposts(req.session.user_id, function(data){
			res.json({listmypost: data})
		})
	}
})

router.route('/user/loadrcpost')
.post(function(req, res){

	if(req.session.user_id){

	}
})


router.route('/user/loadcmt')
.post(function(req, res){

	if(req.session.user_id){
		var postid = req.body.data.id
		if(postid){
			postcomment.selectCmts(req.session.user_id, postid, function(data){
				res.json({listcmts: data})
			})
		}
	}
})


router.route('/user/loadnotify')
.post(function(req, res){

	if(req.session.user_id){

	}
})



module.exports = router;