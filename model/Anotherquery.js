var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "KLTN_ExLanguage",
  charset: "utf8_general_ci"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Mysql Connected Successful!");
});


var editMessage = function(idmsg, whoeditid, content, cb){

	var sql = "SELECT message_id, whoedit FROM editmessage LIMIT 1"
	var sqlString = ""

	con.query(sql, function(err, result, fields){
		if (err) throw err;
		else{
			if(result.length > 0){

				sqlString = "UPDATE editmessage SET newcontent = "+ mysql.escape(content) +
					", time = "+ new Date() +
					" WHERE message_id = "+mysql.escape(idmsg) +
					" AND whoedit = " + mysql.escape(whoeditid)

				con.query(sqlString, function(err1, result1, fields1){
					if(err) cb(null, err1)
					else cb(result1.affectedRows, null)
				})

			}else{//chua co du lieu
				sqlString = "INSERT INTO editmessage (message_id, whoedit, content, time) "+
					"VALUES(" + mysql.escape(idmsg) + "," + mysql.escape(whoeditid) +
					", " + mysql.escape(content)+", "+new Date()+")"

				con.query(sqlString, function(err1, result1, fields1){
					if(err) cb(null, err1)
					else cb(result1.affectedRows, null)
				})
			}
		}
	})
}

function delMessages(idme, iduser, time)
{
	var sql = "DELETE FROM delconversation WHERE ((whodel = "+ mysql.escape(mysql.escape(mysql.escape(idme) + 
		      " AND delwho = "+ mysql.escape(iduser) +
			  ") OR ((whodel = "+ mysql.escape(mysql.escape(iduser) + " AND delwho = "+
			   mysql.escape(idme)+")) AND "+
			  "time <= " + mysql.escape(time)

	con.query(sql, function (err, result) {
    	if (err) throw err;
    	console.log("Number of records deleted: " + result.affectedRows);
  	});
}

var delConversation = function(idme, iduser, cb){
	var sqlString = "SELECT id, time FROM delconversation WHERE "+
				    "whodel = "+ mysql.escape(idme) + " AND delwho = "+ mysql.escape(iduser)

	var sqlString2 = "SELECT id, time FROM delconversation WHERE "+
				     "whodel = "+ mysql.escape(iduser) + " AND delwho = "+ mysql.escape(idme)

    con.query(sqlString, function(err, result, field){
    	if(err) throw err;
    	else{
    		if(result.length > 0){
    			var sqlString1 = "UPDATE delconversation SET time = " + new Date() 
    							 " WHERE id = " + result[0].id

    			con.query(sqlString1, function(err1, result1, field1){
    				if (err1) throw err1;
    				else {
    					 
				        con.query(sqlString2, function(err2, result2, field2){
				        	if(err2) throw err2;
				        	else{
				        		var d = Date.parse(result[0].time.toString());
                                var d1 = Date.parse(result2[0].time.toString());
                                if(d > d1)
                                	delMessages(idme, iduser, d1)
                                else
                                	delMessages(idme, iduser, d)
				        	}
				        })

    				}
    			})

    		}else{
    			var sqlString1 = "INSERT INTO delconversation(whodel, delwho, time)VALUES( "+
    							 mysql.escape(idme) + ", "+imysql.escape(duser)+", "+new Date()+")"

    			con.query(sqlString1, function(err1, result1, field1){
    				if (err1) throw err1;
    				else{

    					con.query(sqlString2, function(err2, result2, field2){
				        	if(err2) throw err2;
				        	else{
				        		var d = Date.parse(result[0].time.toString());
                                var d1 = Date.parse(result2[0].time.toString());
                                if(d > d1)
                                	delMessages(idme, iduser, d1)
                                else
                                	delMessages(idme, iduser, d)
				        	}
				        })
    				}
    			})

    		}
    	}
    })

}


module.exports = {
	editMessage: editMessage
}