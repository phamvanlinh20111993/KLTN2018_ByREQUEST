var express = require('express')
var app = express()
var router = express.Router()
var CryptoJS = require("crypto-js")
var md5 = require('md5') // su dung md5 ma hoa pass
var postcomment = require('../../model/post_comments_query')
var querysimple = require('../../model/QuerysingletableSimple')
var anotherquery = require('../../model/Anotherquery')
const LIMITPOST = 15;



function createSession(req, res, emailuser, passuser){
	querysimple.selectTable("user", ["password", "stay"], [{op:"", field: "email", value: emailuser}],
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
							req.session.mynative = data[0].natsy//kí hieu ngon ngu
							req.session.myexchange = data[0].exsy
							req.session.mynativeid = data[0].natid//kí hieu ma ngon ngu
							req.session.myexchangeid = data[0].exid
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
				else{
				 	anotherquery.select_max_prio_Ex_and_Navtive(result[0].id, function(data){
						req.session.mynative = data[0].natsy//kí hieu ngon ngu
						req.session.myexchange = data[0].exsy
						req.session.mynativeid = data[0].natid//kí hieu ma ngon ngu
						req.session.myexchangeid = data[0].exid
						res.render('ejs/discussion', {user: result})
					})
				}
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
			else{
				anotherquery.select_max_prio_Ex_and_Navtive(result[0].id, function(data){
					req.session.mynative = data[0].natsy//kí hieu ngon ngu
					req.session.myexchange = data[0].exsy
					req.session.mynativeid = data[0].natid//kí hieu ma ngon ngu
					req.session.myexchangeid = data[0].exid
					res.render('ejs/discussion', {user: result})
				})
			}
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
	var limit = parseInt(req.body.data.limit)
	if(req.session.user_id && limit > -1){
		limit *= LIMITPOST
		//3 param, userid, search condition, fitle condition
		postcomment.selectNotMyposts(req.session.user_id, limit, LIMITPOST, null, null, function(data){
			res.json({data: data})
		})
	}
})

//filter post by name or filter
router.route('/user/post/search')
.post(function(req, res){
	if(req.session.user_id){
		var valuesearch = req.body.data.value
		postcomment.selectNotMyposts(req.session.user_id, null, null, valuesearch, null, function(data){
			res.json({data: data})
		})
	}
})

//filter post by name or filter
router.route('/user/post/findpost')
.post(function(req, res){
	if(req.session.user_id){
		var pid = req.body.data.value
		postcomment.selectPostById(req.session.user_id, pid, function(data){
			res.json({data: data})
		})
	}
})

//filter post by topic post
router.route('/user/post/filter')
.post(function(req, res){
	if(req.session.user_id){
		var valuefilter = req.body.data.value
		postcomment.selectNotMyposts(req.session.user_id, null, null, null, valuefilter, 
		 function(data){
			res.json({data: data})
		})
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
	var LITMITPOSTRECENT = 20
	if(req.session.user_id){
		postcomment.selectRecentPost(req.session.user_id, LITMITPOSTRECENT, function(data){
			res.json({data: data})
		})
	}
})


router.route('/user/loadcmt')
.post(function(req, res){

	if(req.session.user_id){
		var postid = req.body.data.id
		var limit = {
			from: req.body.data.limit.from,
			total: req.body.data.limit.total
		}

		if(postid && limit){
			postcomment.selectCmts(req.session.user_id, postid, limit, function(data){
				res.json({listcmts: data})
			})
		}
	}
})


router.route('/user/loadnotify')
.post(function(req, res){

	if(req.session.user_id){
		postcomment.selectNotifyDiscussion(req.session.user_id, function(data){
				res.json({notify: data})
		})
	}
})

//info of user like post 
router.route('/user/loadinfolikepost')
.post(function(req, res){

	if(req.session.user_id){
		var postid = req.body.data.id
		if(postid){
			postcomment.selectUserLikePost(req.session.user_id, postid, function(data){
				res.json({userslikedpost: data})
			})
		}
	}
})

//info of user like post 
router.route('/user/totalpost')
.get(function(req, res){
	var code = null
	if(req.session.user_id){
		postcomment.selectTotalPost(req.session.user_id, code, function(data){
			res.json({total: data})
		})
	}
})

//insert notify like post
router.route('/user/notifylike')
.post(function(req, res){
	var data = req.body.data.data
	var type_id = 7//like
	if(req.session.user_id && typeof data == 'object'){
		//lấy id người nhận
		querysimple.selectTable("post", ["user_id"], [{op: "", field: "id", value: data.post_id}],
         null, null, null, function(result, fields, err){
         if (err) {throw err}
         else{
         	if(result[0].user_id != data.user_id){
					 var field = ["receiver", "creater", "type_id","code", "state", "language_id", "ctime"]
					 var value = [result[0].user_id, data.user_id, type_id, data.post_id, 0, data.language, new Date(data.time)]
					 querysimple.insertTable("notify_discussion", field, value, 
		  	 			function(result1, fields1, err1){
					 		if(err1) throw err1;
					 		else
								res.json({data: result1})
					})
				}
			}
		})
	}
})

//insert notify comment post
router.route('/user/notifycmt')
.post(function(req, res){
	var data = req.body.data.data
	var type_id = 1//comment
	if(req.session.user_id && typeof data == 'object'){
		querysimple.selectTable("post", ["user_id"], [{op: "", field: "id", value: data.post_id}],
            null, null, null, function(result, fields, err){
         if (err) {throw err}
         else{
         	console.log(data)
          	if(result[0].user_id != data.user_id){
	             var field = ["receiver", "creater", "code", "type_id", "state", "language_id", "ctime"]
					 var value = [result[0].user_id, data.user_id, data.cmt_id, type_id, 0, data.language, new Date(data.time)]
					 querysimple.insertTable("notify_discussion", field, value, 
				  		function(result1, fields1, err1){
					 	if(err1) throw err1;
						else
							res.json({data: "Done"})
					}) 
				}        
         }
      })
	}
})

//ham tao de truy van vong lap
var insertTableQueryLoop = function(index, insertvl, Length, array, cb)
{
	if(index < Length){
		//state 0 la trang thai chua doc
		var field = ["receiver", "creater", "code",  "type_id", "state", "language_id", "ctime"]
		var value = [array[index].followers, insertvl.user_id, insertvl.post_id, insertvl.type_id, 0, insertvl.language, new Date(insertvl.time)]

		querysimple.insertTable("notify_discussion", field, value, 
			function(result, fields, err){
				if(err) throw err;
				else
					insertTableQueryLoop(index+1, insertvl, Length, array, cb)
		}) 
	}else
		cb()
}

//insert notify post posts for follow user
router.route('/user/notifypostp')
.post(function(req, res){
	var data = req.body.data.data
	var type_id = 2//post
	
	if(req.session.user_id && typeof data == 'object'){
		data.type_id = 2;
		querysimple.selectTable("follow", ["followers"], [{op: "", field: "tracked", 
		 	value: req.session.user_id}], null, null, null, function(result, fields, err){
         if (err) throw err
         else{
            console.log(result)    
            insertTableQueryLoop(0, data, result.length, result, function(){
            	res.json({data: "Done."})
            })
         }
      })	
	}
})

router.route('/user/changestatenofifypost')
.put(function(req, res){
	if(req.session.user_id){
		//state = 1 là đã xem
		querysimple.updateTable("notify_discussion", [{field: "state", value: 1}], 
			[{op:"", field: "receiver", value: req.session.user_id}], function(result, err){
				if(err) throw err
				else res.json({data: "updated success."})
			})
	}
})

//filter post by name or filter
router.route('/user/post/findpostnotify')
.post(function(req, res){
	if(req.session.user_id){
		var type = req.body.data.type
		var id = req.body.data.id

		if(id && type){
			if(type==1){//comment
				querysimple.selectTable("comment", ["post_id"], [{op:"", field: "id", value:type}],  
					null, null, null, function(result, fields, err){
						if(err) throw err
						else{
							postcomment.selectPostById(req.session.user_id, result[0].post_id, function(data){
								res.json({data: data})
							})
						}
				})
				
			}else{
				postcomment.selectPostById(req.session.user_id, id, function(data){
					res.json({data: data})
				})
			}
		}
		
	}
})

module.exports = router;