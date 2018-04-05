var express = require('express')
var app = express()
var router = express.Router()
var CryptoJS = require("crypto-js")
var md5 = require('md5') // su dung md5 ma hoa pass
var querysimple = require('../../model/QuerysingletableSimple')
var anotherquery = require('../../model/Anotherquery')


function getDateTime(date, addblocktime)
{
	date.setDate(date.getDate() + addblocktime)//auto block messages with 15 days
    return date.getFullYear() +
     '-' + (date.getMonth() + 1) +
     '-' + (date.getDate()) +
     ' ' + (date.getHours()) +
     ':' + (date.getMinutes()) +
     ':' + (date.getSeconds());
}

router.route('/user/allnat')
.post(function(req, res)
{
	if(req.session.user_id){
		anotherquery.selectAllNativelg(req.session.user_id, function(data){
			res.send(JSON.stringify({allnat: data}))
		})
	}
})


router.route('/user/allex')
.post(function(req, res)
{
	if(req.session.user_id){
		anotherquery.selectAllExchangelg(req.session.user_id, function(data){
			res.send(JSON.stringify({allex: data}))
		})
	}
})


router.route('/user/allreport')
.post(function(req, res)
{
	if(req.session.user_id){
		querysimple.selectTable("report_user_content", ["id", "code", "content"], 
			null, null, null, null, function(result, fields, err){
				if(err)	throw err
				else{
					console.log(result)
					res.send(JSON.stringify({report: result}))
				}
			})
	}
})



router.route('/user/changetrasprio')
.put(function(req, res){

	if(req.session.filter){
		console.log(req.body)//update database
		res.send(JSON.stringify({notify: "Done"}))
	}
})


router.route('/user/changemissprio')
.put(function(req, res){

	if(req.session.filter){
		console.log(req.body)//update database
		res.send(JSON.stringify({notify: "Done"}))
	}
})


router.route('/user/report')
.post(function(req, res){

	if(req.session.filter){
		console.log(req.body)//update database
		res.send(JSON.stringify({notify: "Done"}))
	}
})


router.route('/user/delconversation')
.delete(function(req, res){

	if(req.session.filter){
		console.log(req.body)
	}
})


router.route('/user/uncheckmiss')
.post(function(req, res){

	if(req.session.filter){
		querysimple.selectTable("checkmisspellings", ["id"], 
			[{op: "", field: "whocheck",value: req.session.user_id}, 
			  {op: "AND", field: "checkwho", value: parseInt(req.body.id)}], null, null, null, 
		 function(result, fields, err){
		 	if(err) throw err;
		 	else{
		 		if(result.length == 0){
		 			var field = ["whocheck", "checkwho", "ctime"]
		 			var value = [req.session.user_id, parseInt(req.body.id), new Date()]
		 			querysimple.insertTable("checkmisspellings",field, value, function(data, err){
		 					if (err) throw err;
		 					else res.json({data: result.affectedRows})
		 				})
		 		}else
		 			res.json({data: "checked."})
		 	} 
	     })
	}
})

router.route('/user/checkmiss')
.post(function(req, res){

	if(req.session.filter){
		if(req.session.filter){
		querysimple.selectTable("checkmisspellings", ["id"], 
			[{op: "", field: "whocheck",value: req.session.user_id}, 
			  {op: "AND", field: "checkwho", value: req.body.id}], null, null, null, 
		 function(result, fields, err){
		 	if(err) throw err;
		 	else{
		 		if(result.length > 0){
		 			querysimple.deleteTable("checkmisspellings", [{op: "", field: "whocheck",value: req.session.user_id},
		 				{op: "AND", field: "checkwho",value: parseInt(req.body.id)}], function(data, err){
		 					if (err) throw err;
		 					else res.json({data: result.affectedRows})
		 				})
		 		}else
		 			res.json({data: "you unchecked this."})
		 	}
	     })
	}
	}
})


router.route('/user/blockmsg')
.post(function(req, res){

	if(req.session.filter){
		querysimple.selectTable("blockmessages", ["id"], 
			[{op: "", field: "whoblock",value: req.session.user_id}, 
			  {op: "AND", field: "blockwho", value: parseInt(req.body.id)}], null, null, null, 
		 function(result, fields, err){
		 	if(err) throw err;
		 	else{
		 		if(result.length == 0){
		 			var field = ["whoblock", "blockwho", "ctime"]
		 			var value = [req.session.user_id, parseInt(req.body.id), new Date()]
		 			querysimple.insertTable("blockmessages",field, value, function(data, err){
		 					if (err) throw err;
		 					else res.json({data: result.affectedRows})
		 				})
		 		}else
		 			res.json({data: "blocked."})
		 	} 
	     })
	}
})

router.route('/user/unblockmsg')
.post(function(req, res){

	if(req.session.filter){
		querysimple.selectTable("blockmessages", ["id"], 
			[{op: "", field: "whoblock",value: req.session.user_id}, 
			  {op: "AND", field: "blockwho", value: req.body.id}], null, null, null, 
		 function(result, fields, err){
		 	if(err) throw err;
		 	else{
		 		if(result.length > 0){
		 			querysimple.deleteTable("blockmessages", [{op: "", field: "whoblock",value: req.session.user_id},
		 				{op: "AND", field: "blockwho",value: parseInt(req.body.id)}], function(data, err){
		 					if (err) throw err;
		 					else res.json({data: result.affectedRows})
		 				})
		 		}else
		 			res.json({data: "not allowed"})
		 	}
	     })
	}
})


module.exports = router;