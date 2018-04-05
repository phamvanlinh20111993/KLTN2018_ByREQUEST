
//theo doi hoac bo theo doi nguoi dung
var ajaxRequest = function(url, data, callback) {//data is a object
  // body...
  $.ajax({
        type: "POST",
        url: url,
        data:{ data: JSON.stringify(data) },
        error: function(xhr, status, error){
          callback(null, error)
        },
        success: function(data)
        {
            if(typeof callback == "function"){
                callback(data, null);//tra ve du lieu
            }
        }
    })
}

//gui du lieu len server
var Translate_or_Misspelling = function(url, myex, mynat, content, cb){
    $.ajax({
        type: "POST",
        url: url,
        data:{nat: mynat, ex: myex, content: content},
        success: function(data)//hien thi message
        {
            if(typeof cb == "function")
                cb(JSON.parse(data));//tra ve du lieu
        }
    })
}


/**
	url: link to server
	type: kieu POST,PUT, GET OR DELETE
	data: oject
**/

var requestServer = function(url, type, data, choose, cb){
    // Set up the AJAX request.
    var xhr = new XMLHttpRequest();
    // Open the connection.
    xhr.open(type, url, true);

    var formData;

    if(choose == 2){//set of key/value pairs to send, set to multipart/form-data.
    	formData = new formData();
    	formData.append("data", data)
   		xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
   	}else if(choose == 1){//body string
   		formData = data;
   	    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   	}else{//json string
   		formData = JSON.stringify({data: data})
      	xhr.setRequestHeader("Content-type", "application/json");
     }

    // Set up a handler for when the request finishes.
    xhr.onload = function () {
        if (xhr.status === 200){
          //  console.log("da chay thanh cong ham request")
        }
        else{
        	cb("An unknown error. ", null)
           	console.log("xay ra loi khong xac dinh. Sorry!!!")
        }
    };

    // Send the Data to server
    xhr.send(formData);

    //take data from server responsible
    xhr.onreadystatechange = function(){
    	//State = 4 is request finished and response is ready, xhr.status == 200 is 200: "OK"
        if(xhr.readyState == 4){
        	if(xhr.status === 200){
        		var data_response = JSON.parse(xhr.responseText);
            	cb(null, data_response)
            }else{
            	var err = "Status code err: " + xhr.status
            	cb(err, null)
            }
        }
    }
}


//ham chuyen doi thoi gian so voi hien tai
function Change_date(Date_time)
{
    var second, d, d1, date_now, text; 
    d = new Date();//lay thoi gian hien tai
    d1 = new Date(String(Date_time));//;lay thoi gian da dang
    second = parseInt((d - d1)/1000);//thoi gian hien tai va thoi gian da dang
    if(second < 60) text = "Just now";
    else if(second > 60 && second < 3600)            text =parseInt(second/60)+" Minutes before";
    else if(second >= 3600 && second < 86400)        text = "About "+parseInt(second/3600)+" Hours ago"; 
    else if(second >= 86400 && second < 2592000)     text = parseInt(second/86400)+" Days ago"; 
    else if(second >= 2592000 && second < 946080000) text = parseInt(second/2592000)+" Months ago";
    else                                             text = "Long time ago";     
    return text;                               
}


var formatTime = function(datestr){
	var date = new Date(datestr)
	var Hours = date.getHours()
	var Day = date.getDate()

	Hours = Hours - 7;
	if(Hours < 0){
		Hours = Hours + 24
		Day--;
	}

	return Hours+":"+ date.getMinutes() + " "+
			Day + "/" + (date.getMonth()+1) + "/" + date.getFullYear()
}

var Notify = function(){
	$('#Notify_post').modal('show')

}


var showTopic = function(topic)//topic is a object
{
	//console.log(topic)
	var topicPost = document.getElementById('topicpost')
	var tpLg = topic.length-1;
	var element = '<option style="font-size:130%;" selected value="'+topic[tpLg].id+'">'+
	               topic[tpLg].name+'</option>'

	for(var index = tpLg-1; index >= 0; index--){
		element += '<option style="font-size:130%;" value="'+topic[index].id+'">'+
		           '<b>'+topic[index].name+'</b></option>'
	}

	topicPost.innerHTML = element
}


var loadTitlePost = function(){
	requestServer('/languageex/user/loadtitle', 'POST', {}, 0, function(err, data){
		if(err)  alert(err)
		else   showTopic(data.data)
	})	
}
loadTitlePost()


var showOrderTopic = function(topic)//topic is a object
{
	//console.log(topic)
	var topicPost = document.getElementById('fitlerbytopicpost')
	var tpLg = topic.length-1;
	var element = '<option style="font-size:130%;" selected value="-1">None</option>'

	for(var index = tpLg; index >= 0; index--){
		element += '<option style="font-size:130%;" value="'+topic[index].id+'">'+
		           '<b>'+topic[index].name+'</b></option>'
	}

	topicPost.innerHTML = element
}

var loadRequirePost = function(){
	requestServer('/languageex/user/loadtitle', 'POST', {}, 0, function(err, data){
		if(err)  alert(err)
		else   showOrderTopic(data.data)
	})	
}
loadRequirePost()
	
/**
	Posts: object chua thong tin cua bai dang
	User object chua thong tin nguoi da dang
	state la trang thai cua load tu server hoac dang realtime
**/

var showPost = function(User, Posts, state)
{
	var element = "";
	var id = Posts.pid;

	var imgLike = "/img/dalike.jpg"
	var contentLike = "Liked"

	if(!Posts.meliked){
		imgLike = "/img/dislike.png"
		contentLike = "Like"
	}

	var Time;
	if(state == 0)	Time = Change_date(Posts.time)
	else	Time = Change_date(new Date())

	var isMyPost = "", notMypost = ""
	if(User.id == MYID){
		isMyPost = '<a style="cursor:pointer;" onclick="deleteMyPost('+id+')">Delete post</a>'+
                '<a style="cursor:pointer;" onclick="editMyPost('+id+')">Edit post</a>'+
                '<a style="cursor:pointer;" onclick="turnofComment('+id+')">Turn off comment</a>'
	}

	if(User.id != MYID){
		notMypost = '<a style="cursor:pointer;" onclick="reportPost('+id+',\''+User.name+'\')">Report post</a>'+
                   '<a style="cursor:pointer;" onclick="">Turn off notify</a>'
	}

	var istracked = ""
	if(Posts.istracked){
	  istracked = " (followed)"
	  notMypost += '<a style="cursor:pointer;" onclick="unFollow('+User.id+', \''+User.name+'\')">Unfollow '+User.name.split(" ")[0]+'</a>'
	}

	var contenlikepost = ""
	if(Posts.meliked)
		contenlikepost='<span id="'+id+'_stringnumlike">You and </span><span>'+(Posts.totalliked-1)+'</span> people liked post.</a></div>'
	else
		contenlikepost='<span id="'+id+'_stringnumlike"></span><span>'+Posts.totalliked+'</span> people likes post.</a></div>'

    element = '<div class="popup-box4" id="'+id+'_posts">'+

             '<div class="dropdown">'+
              '<a class="dropbtn"><h5 class="glyphicon glyphicon-chevron-down"></h5></a>'+
              '<div class="dropdown-content">'+
                 notMypost+
                 isMyPost+
              '</div>'+
             '</div>'+

              '<table style="margin-left: 5px;height:80px;">'+
                '<tr style="margin-top:5px;">'+
                  '<td><img src="'+User.photo+'" style="height:47px;width:47px;" data="tooltip" title="'+User.email+'"></td>'+
                 '<td><div style="margin-left:8px;padding:0px;">'+
                          '<p style="color:blue;margin-top:4px;">'+
                              '<a style="font-size:108%;cursor:pointer;" class="text-justify" href="/languageex/user/profile?uid='+User.id+'"><b>'+User.name+'</b></a>'+
                                  ' discussed the topic <b style="color:black;font-size:150%;">'+Posts.title+'</b>'+
                          '</p><div style="margin-top:-9px;">'+
                                  '<label style="font-size:90%;">'+Time+'</label> '+istracked+'</div></div>'+
                    '</td>'+
                '</tr>'+
              '</table>'+

                '<div style="height:auto;margin-top:10px;" class="form-group" >'+

                  '<div id="'+id+'_contentofpost" style="font-size:17px;color:orange;background-color:white;height:auto;word-wrap:break-word;margin-left:2%;">'+
                   Posts.content+'</div>'+

                   '<textarea id="'+id+'_contenteditpost" class="form-control" style="display:none;height:auto" autofocus>'+Posts.content+'</textarea>'+

                   '<div id="'+id+'_showtrans" style="font-size:17px;color:black;background-color:white;'+
                       'height:auto;word-wrap:break-word;margin-left:2%;display:none;margin-top:2%;"></div>'+

                  '<a id="'+id+'_showlink" style="margin-left:3%;cursor:pointer;text-decoration:none;" onclick="translatePost('+id+')">See translation</a>'+
                  '<a id="'+id+'_hiddenlink" style="margin-left:3%;cursor:pointer;text-decoration:none;display:none;" onclick="backUpTranslate('+id+')">Hidden trans</a>'+
                  '<a id="'+id+'_editpostdone" style="margin-left:3%;cursor:pointer;text-decoration:none;display:none;" onclick="editPostDone('+id+')">Edit done</a>'+
                  '<input type = "hidden" id = "'+id+'_postcontent" value = "'+Posts.content+'">'+
                  '<div style="float:right;margin-right:10px;border: 1px solid blue;"></div>'+
                '</div>'+

                '<div class="divcmt">'+
                  '<img src="'+imgLike+'" onclick="likeOrDis('+id+')" id="'+id+'_likesrc" style="margin-left:5px;width:36;height:29px;">'+
                  '<p style="margin-top:-24px;margin-left:50px;color:blue;" id="'+id+'_likect">'+contentLike+'</p>'+
                  '<div style="margin-top:-22px;margin-left:26%;">'+
                     '<a style="cursor:pointer;" onclick="showUserLikePost('+id+')">'+
                   	  contenlikepost+
                  '</div>'+

                  '<div class="divcmt1">'+
				
                    '<div style="border:1px solid #d5e8e8;height:auto;">'+
                      '<div style="margin-top:12px;">'+
                        '<a class="a4" onclick="showMoreComment('+id+')">Show more comments(<span id="'+id+'_numcmt">'+Posts.totalcomment+'</span>)</a>'+
                      '</div>'+
                      '<div style="width: auto;height: auto;" id="'+id+'_showcmt"></div>'+
                    '</div>'+

                    '<div style="margin-top:18px;margin-left:10px;">'+
                     '<table>'+
                       '<tr>'+
                        '<td><img src="'+MYPHOTO+'" style="height:40px;width:42px;margin-top:5px;margin-left:-1px;" data="tooltip" title="'+MYNAME+'"></td>'+
                        '<td style="width:94%;">'+
                           '<input type="text" placeholder="Write your comments...." class="divcmt2" '+
                             'onkeypress="submitComment(event,'+id+')" id="'+id+'_writecmts">'+
                        '</td>'+
                       '</tr>'+
                     '</table>'+
                    '</div>'+

                   '<div style="height:30px; margin-top:0px;"></div>'+
                '</div>'+

            '</div>'

     document.getElementById("showpostusers").innerHTML += element
}

/**
	@@ id is post id
**/
var editMyPost = function(id){
	var _textareaEdit = document.getElementById(id+"_contenteditpost")
	var _postcontent = document.getElementById(id+"_contentofpost")
	var _buttonEditDone = document.getElementById(id+"_editpostdone")
	_textareaEdit.style.display = "block"
	_postcontent.style.display = "none"
	_buttonEditDone.style.display = "block"
}

/** 
	This function happen when event editMyPost are execute
	@@ id is a post of id
**/
var editPostDone = function(id){
	var _textareaEdit = document.getElementById(id+"_contenteditpost")
	var _postcontent = document.getElementById(id+"_contentofpost")
	var _buttonEditDone = document.getElementById(id+"_editpostdone")
	var _showlink = document.getElementById(id+"_showlink")
	var _showtrans = document.getElementById(id+"_showtrans")
	var _postcontenthd = document.getElementById(id+"_postcontent")	//input type hidden
	var newcontent = _textareaEdit.value

	if(newcontent == "" || newcontent.length < 100)
		alert("Please dont edit your post under 100 characters.")
	else if(_postcontent.innerHTML == newcontent)//noi dung moi va cu trung nhau
		alert("This is old content.Please try again.")
	else{
		_showtrans.innerHTML = "" //reset content of translation
		_postcontenthd.value = newcontent
		var data = {pid: id, uid: MYID, content: newcontent, time: new Date()}
		requestServer('/languageex/user/editPost', 'PUT', data, 0, function(err, data){
			if(err) alert(err)
			_textareaEdit.style.display = "none"
			_postcontent.innerHTML = newcontent
			_postcontent.style.display = "block"
			_showlink.style.display = "block"
			_buttonEditDone.style.display = "none"
		})
	}
}

/**
	this funtion will delete a post with id @@id
**/
var deleteMyPost = function(id){
	var r = confirm("Are you sure want to delete your post?")
	if(r == true){
		requestServer('/languageex/user/delpost', 'DELETE', {pid: id}, 0, function(err, data){
			if(err) alert(err)
			else{
			//	console.log(data)
				document.getElementById(id+"_posts").style.display = "none"
			}
		})	
	}
}
 
/**
	click event image like
	@@ id is id of post
**/
var likeOrDis = function(id){
	var imgStateLike = document.getElementById(id+"_likesrc")
	var contentLike = document.getElementById(id+"_likect")
	var strnumlike = document.getElementById(id+"_stringnumlike")

	var namesrc = imgStateLike.src.replace(/^.*[\\\/]/, '');
	if(namesrc == "dalike.jpg"){
		requestServer('/languageex/user/likepost', 'DELETE', {id: id}, 0, function(err, data){
			if(err) alert(err)
			else{
				imgStateLike.src = "/img/dislike.png"
				contentLike.innerHTML = "Like"
				strnumlike.innerHTML = ""
			}
		})
		
	}else{
		requestServer('/languageex/user/likepost', 'POST', {id: id, time: new Date()}, 0, function(err, data){
			if(err) alert(err)
			else{
				imgStateLike.src = "/img/dalike.jpg"
				contentLike.innerHTML = "Liked"
				strnumlike.innerHTML = "You and "
			}
		})
	}
}

/**
	hien thi nhung nguoi dung like bai dang
**/
var showUserLikePost = function(postid)
{
	$('#showuserlikespost').modal('show')
	var element = '<table class="table"><tbody>'
	requestServer('/languageex/user/loadinfolikepost', 'POST', {id: postid}, 0, function(err, data){
		if(err) alert(err)
		else{
			if(data){
			 	var Length = data.userslikedpost.length
			 	var modalBody = document.getElementById("showuserlikespost").getElementsByClassName("modal-body")[0]
			 	if(Length > 0){
					for(var ind = 0; ind < Length; ind++){
						element += '<tr><td><img class="img-rounded" height="40" width="40" alt="Avatar" src="'+
					       data.userslikedpost[ind].photo+'" data="tooltip" title="'+data.userslikedpost[ind].email+'"></td>'+
					       '<td><h4>'+data.userslikedpost[ind].name+'</h4></td>'+
					       '<td><button type="button" class="btn btn-success" onclick="viewInfoLikePost('+data.userslikedpost[ind].id+')">View info</button></td>'
					}
					element += '</tbody></table>'
					modalBody.innerHTML = element
			 }else
			 	modalBody.innerHTML = ""
		    }
		}
	})

}

/**
	when user click to show information of users like specific like post, button view infor 
	is call with even viewInfoLikePost
	@@ id of user
**/
var viewInfoLikePost = function(id){
	alert("hihi")
	location.href = "/languageex/user/profile?uid="+encodeURIComponent(id)
}

/**
	translate content of post
	@@ id is id of post
**/
var translatePost = function(id){

    var _showtrans = document.getElementById(id+"_showtrans")
    var _showlink = document.getElementById(id+"_showlink")	
    var _hiddenlink = document.getElementById(id+"_hiddenlink")	
    var content = document.getElementById(id+"_postcontent").value

	if(_showtrans.innerHTML == ""){	
	 	Translate_or_Misspelling("/languageex/user/translate", 
			MYPRIOEX, MYPRIONAT, content, function(data){	  	
			if(data.content.error == null){
		   		_showtrans.innerHTML = data.content.translated
			}else
				_showtrans.innerHTML = data.content.error

			_hiddenlink.style.display = "block";
		    _showlink.style.display = "none";	
		    _showtrans.style.display = "block"
		})
	}else{
		_hiddenlink.style.display = "block";
		_showlink.style.display = "none";
		_showtrans.style.display = "block"
	}

}

/**
	this funtion happen when user want to hidden translate text
	@@ id is id of post
**/
var backUpTranslate = function(id){
	var _showtrans = document.getElementById(id+"_showtrans")
    var _showlink = document.getElementById(id+"_showlink")	
    var _hiddenlink = document.getElementById(id+"_hiddenlink")	

    _hiddenlink.style.display = "none";
    _showlink.style.display = "block";	
    _showtrans.style.display = "none"
}

/**
 make random id for comments
**/
function makerandomid(){
    var text = "";
    var possible = "0123456789";

    for( var i = 0; i < 20; i++ )//ma xac thuc co ngau nhien 45 ki tu
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
/**
	postid la id cua bai dang
	Commentinfor la 1 object chua thong tin cua commnet
	Userinfo la thong tin cua nguoi comment
	state la trang thai load tu server hoac realtime
 **/
var showComment = function(postinfo, Commentinfo, Userinfo, state){
	var element = '', ismycmt = "", ismypost = "";
	var Time, randomid = makerandomid();
	
	if(state == 0){
		Time = formatTime(Commentinfo.time)
	}else
		Time = formatTime(new Date())

	if(MYID == Userinfo.id){//neu comment la cua toi thi t co the xoa hoac edit no
		ismycmt = '<a class="a11" onclick="deleteMyCmt('+Commentinfo.id+',\''+randomid+'\')">  del  </a>'+
                  '<a class="a11" onclick="editMyCmt(\''+randomid+'\')">  edit  </a>'
	}else{
		/*toi la chu so huu cua bai dang thi bat ki ai(tru toi) comment trong bai dang cua toi
		thi toi co quyen xoa bai dang do nhung comment do khong phai la cua toi*/
		if(MYID == postinfo.own)
			ismypost = '<a class="a11" onclick="deleteMyCmt('+Commentinfo.id+',\''+randomid+'\')">  del  </a>'
	}

	var isedit = ""
	if(Commentinfo.isedit > 0)
		isedit = '<span style="color:#660099;"> (edited)</span>'

    element = '<div style="min-height:40px;margin-top:5px;" id="'+randomid+'_idcomment">'+
         '<img src="'+Userinfo.photo+'" width="41" height="42" style="float:left;margin-left:10px;margin-top:-2px;">'+
         '<p style="width:85%;word-wrap:break-word;margin-left:65px;"><span style="color:blue;font-size:108%;">'+Userinfo.name+'</span>  '+
           '<span id="'+randomid+'_cmtcontentshow">'+Commentinfo.content+'</span> '+ isedit+
           '<textarea id="'+randomid+'_editcmtcontent" class="form-control" style="height:auto;display:none;" onkeypress="editCmtDone(event,'+Commentinfo.id+',\''+randomid+'\')"'+
             'autofocus data="tooltip" title="Press enter end edit.">'+Commentinfo.content+'</textarea>'+
            '</br> <span style="font-style:inherit;color:red;" id="'+randomid+'_showtranscmt"></span>'+
         '</p>'+

         '<div style="height:10px;margin-left:65px;font-size:90%;color:#474343;margin-top:-7px;">'+
         	ismycmt+
         	ismypost+
            '<a class="a11" onclick="translateCmt(\''+randomid+'\')">  trans  </a>'+
            '<span style="margin-left:10px;font-size: 80%;">'+Time+'</span>'+
         '</div>'+
         '<input type="hidden" value="'+Commentinfo.content+'" id="'+randomid+'_cmtcontent" >'+
    '</div>'+
    '<div style="height:10px; margin-top:0px;"></div>'

    document.getElementById(postinfo.id+"_showcmt").innerHTML += element
}

/**
 id is a random id of comment
**/
var MAXTIMESHOWTRANSCMT = 15000//max time show translate comment
var translateCmt = function(id)
{
	var contenttrans = document.getElementById(id+"_cmtcontent").value
	var _showtranscmt = document.getElementById(id+"_showtranscmt")

	if(_showtranscmt.innerHTML == ""){
		Translate_or_Misspelling("/languageex/user/translate", 
			MYPRIOEX, MYPRIONAT, contenttrans, function(data){	  	
			if(data.content.error == null){
				if(data.content.translated == "")
					_showtranscmt.innerHTML = "Error translate."
				else
					_showtranscmt.innerHTML = data.content.translated
			}
			else
				_showtranscmt.innerHTML = data.content.error
			setTimeout(function(){
				_showtranscmt.style.display = "none"
			}, MAXTIMESHOWTRANSCMT)
		})
	}else{
		_showtranscmt.style.display = "block"
		setTimeout(function(){
			_showtranscmt.style.display = "none"
		}, MAXTIMESHOWTRANSCMT)
	}

}

/**
	@@postinfo is a object contain post id and own of post
**/
var requestComment = function(postinfo){
	requestServer('/languageex/user/loadcmt', 'POST', {id: postinfo.id}, 0, function(err, data){
		if(err) alert(err)
		else{
			//console.log(data)
			var Length = data.listcmts.length
			var _showmorecmt = document.getElementById(postinfo.id+"_numcmt")
			_showmorecmt.innerHTML = parseInt(_showmorecmt.innerHTML) - Length
			if(Length > 0){
				for(var ind = 0; ind < Length; ind++){
					showComment(postinfo, data.listcmts[ind].comment, data.listcmts[ind].user, 0)
				}
			}
		}
	})
}

/** 
	@@ id is id of comment
	@@ rid is set id for DOM element and we proces with this
**/
var deleteMyCmt = function(id, rid){
	var r = confirm("Are you sure want to delete this comment?")
	var _DOMcmt = document.getElementById(rid+"_idcomment")
	if(r == true){
		requestServer('/languageex/user/delcmt', 'DELETE', {id: id, uid: MYID}, 0, function(err, data){
			if(err) alert(err)
			else{//tra du lieu ve thanh cong
				console.log(data)
				_DOMcmt.style.display = "none"
			}
		})
	}
}

/** 
	@@ rid is set id for DOM element and we proces with this
	show textarea, hidden content comment 
**/
var editMyCmt = function(rid){
	var contentshow = document.getElementById(rid+"_cmtcontentshow")
	var textareaedit = document.getElementById(rid+"_editcmtcontent")
	var oldcontent = textareaedit.value
	contentshow.innerHTML = ""
	textareaedit.style.display = "block"
	textareaedit.value = ""
    textareaedit.focus()
    textareaedit.value = oldcontent
}

/**
	this function happen went user click edit cmt and take event press keyboard
	@@ id is id of comment
    @@ rid is set id for DOM element and we proces with this
**/
var editCmtDone = function(e, id, rid){
	var oldcontent = document.getElementById(rid+"_cmtcontent").value
	var textareaedit = document.getElementById(rid+"_editcmtcontent")
    var _showtranscmt = document.getElementById(rid+"_showtranscmt")
    var showcontentcmt = document.getElementById(rid+"_cmtcontentshow")
   
    if(e.keyCode == 13){
    	e.preventDefault();
    	var newcontent = textareaedit.value
    	if(newcontent == oldcontent){
    		alert("Comment not change.")
    		textareaedit.style.display = "none"
    		showcontentcmt.innerHTML = newcontent
    	}else if(newcontent == ""){
    		alert("Dont leave comment empty.")
    	}else{
    		var editcomment = {id: id, content: newcontent, time: new Date()}
    		requestServer('/languageex/user/editCmt', 'PUT', editcomment, 0, function(err, data){
				if(err) alert(err)
				else{//tra du lieu ve thanh cong
					//console.log(data)
					textareaedit.style.display = "none"
					document.getElementById(rid+"_cmtcontent").value =  newcontent
					showcontentcmt.innerHTML = newcontent
					_showtranscmt.innerHTML = "" //reset
				}
		    })
    		
    	}
    	
    }

}

var divcontentpost = document.getElementById("commentinpost")
var content = divcontentpost.getElementsByTagName("textarea")[0]
var errnotify = divcontentpost.getElementsByTagName("p")[0]


content.onclick = function(){
	errnotify.style.display = "none"
}

/**
	create post of user
**/
var submitPost = function(){
	
	if(content.value == ""){
		errnotify.innerHTML = "##) Do not empty this field."
		errnotify.style.display = "block"

	}else if(content.value.length < 100){
		errnotify.innerHTML = "##) This discussion too short, may be > 100 characters."
		errnotify.style.display = "block"
	}else{

		var selectTitle = document.getElementById("topicpost")
		var value = selectTitle[selectTitle.selectedIndex].value;
		var data = {content: content.value, title: value, time: new Date()}//data submit to server

		var User = {//user object
			id: MYID,
			email: MYEMAIL,
			level: MYLEVEL,
			name: MYNAME,
			photo: MYPHOTO,
			score: MYSCORE
		}

		var Posts = {//post object
			pid: null,
			istracked: null,
			meliked: false,
			content: content.value,
			time: data.time,
			title: selectTitle[selectTitle.selectedIndex].text,
			totalcomment:0,
			totalliked:0,
			turnofcmt:0,
		}

		requestServer('/languageex/user/createPost', 'POST', data, 0, function(err, data){
			if(err) alert(err)
			else{//tra du lieu ve thanh cong
				content.value = ""
				selectTitle.selectedIndex = "0";
				var allpostafter = document.getElementById("showpostusers").innerHTML
				document.getElementById("showpostusers").innerHTML = ""
				Posts.pid = data.resp
				showPost(User, Posts, 1)
				document.getElementById("showpostusers").innerHTML += allpostafter
			}
		})
	}
}

/**
	@@e: check event press keyboard
	@@ postid: user comment in specifix post
**/
var submitComment = function(e, postid){
	if(e.keyCode == 13){
		var contentcmt = document.getElementById(postid+"_writecmts")
		if(contentcmt.value == "")
			alert("Please dont enter empty characters.")
		else{
			//contentcmt.setSelectionRange(0,0); using for textarea
			//submit to server
			var data = {id: postid, uid: MYID, content: contentcmt.value, time: new Date() }
			requestServer('/languageex/user/createcmt', 'POST', data, 0, function(err, dataid){
				if(err) alert(err)
				else{
					contentcmt.value = ""
					data.id = dataid.res
					var User = {id: MYID, name: MYNAME, photo: MYPHOTO, level: MYLEVEL, score: MYSCORE};
					showComment({id: postid, own: MYID}, data, User, 1)
				}
			})
		}
	}
}

/** 
 auto return all of posts
**/
var selectComunityPost = function(){
	document.getElementById("showpostusers").innerHTML = ""
	document.getElementById("fitlerbytopicpost").selectedIndex = "0";
	requestServer('/languageex/user/loadpost', 'POST', {}, 0, function(err, data){
		if(err) alert(err)
		else{
			var Length = data.data.length
			if(Length){
				console.log(data)
				for(var ind = 0; ind < Length; ind++){
		 			showPost(data.data[ind].user, data.data[ind].posts, 0)
		 			requestComment({id: data.data[ind].posts.pid, own: data.data[ind].user.id})
		 		}
		 	}
		}
	})
}
//tu dong load comment về máy cung post
selectComunityPost();

var selectRecentPost = function(){
	document.getElementById("fitlerbytopicpost").selectedIndex = "0";
	document.getElementById("showpostusers").innerHTML = ""
	requestServer('/languageex/user/loadrcpost', 'POST', {}, 0, function(err, data){
		if(err) alert(err)
		else {
			console.log(data)
			var Length = data.data.length
			if(Length){
				for(var ind = 0; ind < Length; ind++){
		 			showPost(data.data[ind].user, data.data[ind].posts, 0)
		 			requestComment({id: data.data[ind].posts.pid, own: data.data[ind].user.id})
		 		}
		 	}
		}
	})
}
/**
	select post of own user
**/
var selectMyPost = function()
{
	document.getElementById("fitlerbytopicpost").selectedIndex = "0";
	document.getElementById("showpostusers").innerHTML = ""
	requestServer('/languageex/user/loadmypost', 'POST', {}, 0, function(err, data){
		if(err) alert(err)
		else{
			console.log(data)
			var Length = data.listmypost.posts.length
			if(Length){
				for(var ind = 0; ind < Length; ind++){
		 			showPost(data.listmypost.user, data.listmypost.posts[ind], 0)
		 			requestComment({id: data.listmypost.posts[ind].pid, own: data.listmypost.user.id})
		 		}
		 	}
		}
	})
}

/**
	report post with
	@@ id param is id of post
	@@ name post of user's name
**/
var reportPost = function(id, name)
{
	$('#reportPostUser').modal('show')
	var reportp = document.getElementById("reportPostUser")
	var reportpBody = reportp.getElementsByClassName("modal-body")[0]
	var reportTitle = reportp.getElementsByClassName("modal-title")[0]
	reportTitle.innerHTML = "Why report this post of "+name+" ?"

	requestServer('/languageex/user/loadrppost', 'GET',{}, 0, function(err, data){
		if(err) alert(err)
		else{
			var element = ""
			console.log(data)
			for(var ind = 0; ind < data.data.length; ind ++){
		 		element += '<div class="checkbox">'+
            	 	'<label><input type="checkbox" value="'+data.data[ind].code+'" name="'+data.data[ind].id+'">'+
            		 data.data[ind].content+'</label></div>'
			}
			reportpBody.innerHTML = element
		}
	})
}


/**
	@@id is id of post
**/

var showMoreComment = function(id){
	alert("clicked me")
	var totalcmt = document.getElementById(id+"_numcmt").innerHTML
	totalcmt = parseInt(totalcmt)
}


/**
	find post's user
**/

//search by click
var SearchUsersClick = function(id){
  var searchvalue = document.getElementById("searchuserex")
    if(searchvalue.value == ""){
      alert("Null value.")
    }else{
      document.getElementById("showpostusers").innerHTML = ""
	  requestServer('/languageex/user/post/search', 'POST', {value: searchvalue.value}, 0, function(err, data){
		 if(err) alert(err)
		 else{
			var Length = data.data.length
			if(Length > 0){
				document.getElementById("showpostusers").innerHTML = "<h3>("+Length+") Results match.</h3>"
				for(var ind = 0; ind < Length; ind++){
		 			showPost(data.data[ind].user, data.data[ind].posts, 0)
		 			requestComment({id: data.data[ind].posts.pid, own: data.data[ind].user.id})
		 		}
		 		MycommunityExchange.innerHTML  +=  "<button type='button' class='btn btn-link' onclick='backToStart()'>Back to the start</button"
		 	}else{
		 		document.getElementById("showpostusers").innerHTML = "<div class='alert alert-danger' style='margin-top:10%;'>"+
                      "<strong>Danger!</strong>No results match.</div>"+
                      "<button type='button' class='btn btn-link' onclick='backToStart()'>Back to the start</button"
		 	}
		 }
	 })
	}
}

//search by press enter keyboard
var SearchUsersEnter = function(e, id){
  if(e.keyCode == 13){
    var searchvalue = document.getElementById("searchuserex")
    if(searchvalue.value == ""){
      alert("Null value.")
    }else{
      document.getElementById("showpostusers").innerHTML = ""
	  requestServer('/languageex/user/post/search', 'POST', {value: searchvalue.value}, 0, function(err, data){
		 if(err) alert(err)
		 else{
			var Length = data.data.length
			if(Length > 0){
				document.getElementById("showpostusers").innerHTML = "<h3>("+Length+") Results match.</h3>"
				for(var ind = 0; ind < Length; ind++){
		 			showPost(data.data[ind].user, data.data[ind].posts, 0)
		 			requestComment({id: data.data[ind].posts.pid, own: data.data[ind].user.id})
		 		}
		 		document.getElementById("showpostusers").innerHTML+=  "<button type='button' class='btn btn-link' onclick='backToStart()'>Back to the start</button"
		 	}else{
		 		document.getElementById("showpostusers").innerHTML = "<div class='alert alert-danger' style='margin-top:10%;'>"+
                      "<strong>Danger!</strong>No results match.</div>"+
                      "<button type='button' class='btn btn-link' onclick='backToStart()'>Back to the start</button"
		 	}
		 }
	 })
    }
  }
}

var backToStart = function(){
   document.getElementById("fitlerbytopicpost").selectedIndex = "0";
   selectComunityPost();
}

//loc bai dang theo chu de
var filterByTopicPost = function(){
  $('#fitlerbytopicpost option').each(function() {
    if($(this).is(':selected'))
    {
    	var topicid = $(this).val()
    	document.getElementById("showpostusers").innerHTML = ""
	    requestServer('/languageex/user/post/filter', 'POST', {value: topicid}, 0, function(err, data){
		 if(err) alert(err)
		 else{
			var Length = data.data.length
			if(Length > 0){
				document.getElementById("showpostusers").innerHTML = "<h3>("+Length+") Results match.</h3>"
				for(var ind = 0; ind < Length; ind++){
		 			showPost(data.data[ind].user, data.data[ind].posts, 0)
		 			requestComment({id: data.data[ind].posts.pid, own: data.data[ind].user.id})
		 		}
		 		document.getElementById("showpostusers").innerHTML+=  "<button type='button' class='btn btn-link' onclick='backToStart()'>Back to the start</button"
		 	}else{
		 		document.getElementById("showpostusers").innerHTML = "<div class='alert alert-danger' style='margin-top:10%;'>"+
                      "<strong>Danger!</strong>No results match.</div>"+
                      "<button type='button' class='btn btn-link' onclick='backToStart()'>Back to the start</button"
		 	}
		 }
	    })
	   
    }
  })
}

//unfollow user
var unFollow = function(id, name){
	var conf = confirm("Are you sure want to unfollow "+ name + " ?")
	if(conf == true){
		var data = {id: id, follow: false} 
	    ajaxRequest('/languageex/home/unfollow', data, function(data, err){
			if(err) alert(err)
            else{
                alert("You unfollowed "+ name)
                location.reload()
            }
		})
	}
}