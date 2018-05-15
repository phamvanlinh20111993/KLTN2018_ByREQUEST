   
   var PARTNERID = 0;

   var socket = require('socket.io-client')();

   socket.on('connect', function(data) {
      //ban dau la khi nguoi dung ket noi         
      socket.emit('notifyOnline', MYID);//client bao voi server la t online roi
   });

       //loi ket noi
   socket.on('connect_error', function(err){
      alert(err + ". Lỗi kết nối server.")
   })

   //loi timeout
   socket.on('connect_timeout', function(err){
      alert(err + ". Thời gian phản hồi quá lâu.")
   })

  //nguoi gui tao ma
   socket.on('callercreatecode', function(data1){

   	if(data1.pid == MYID){
   		PARTNERID = MYID
	   	console.log("ben gui da chay")
			navigator.getUserMedia = navigator.getUserMedia ||
			                         navigator.webkitGetUserMedia ||
			                         navigator.mozGetUserMedia;
									 
			navigator.getUserMedia({ video: true, audio: true }, gotMedia, function () {})

			function gotMedia (stream) {

				var Peer = require('simple-peer')
				var peer1 = new Peer({ initiator: true, reconnectTimer: 300, iceTransportPolicy: 'relay',
					 config: {
				        iceServers: [
				          {
				            "urls": "stun:numb.viagenie.ca",
				            "username": 'phamvanlinh20111993@gmail.com',
				            "credential": 'a12345'
				          },
				          {
				            "urls": "turn:numb.viagenie.ca",
				            "username": "phamvanlinh20111993@gmail.com",
				            "credential": "a12345"
				          }
				        ]
				      },	
					 trickle: false , stream : stream});
				console.log(peer1);

				peer1.on('signal', function (data) {
					console.log("code " + JSON.stringify(data))
					socket.emit('sendcodetoreceiver', {caller:data1.myid, receiver:data1.pid, code:JSON.stringify(data)})
					document.getElementById('key').value = JSON.stringify(data)
				})

				socket.on('createdcall', function(data){
					console.log(data.code)
					console.log("da xong")
					if(typeof data.code.type !== undefined){
						console.log("run nao")
						peer1.signal(JSON.parse(data.code));
					}
				})

				 peer1.on('connect', function(){
     				 console.log('Đã kết nối');
    			 });

    			 peer1.on('error', function (err) { console.log('error', err) })

				peer1.on('stream', function(stream){
					var video = document.querySelector('video');
					video.srcObject = stream;
					//video.play();
					var playPromise = video.play();

				  	if (playPromise !== undefined) {
				    	playPromise.then(_ => {
				      
				    	})
				    	.catch(error => {

				    	});
				  	}
				});
			}
		}

	})


   //nguoi nhan lay ma cua nguoi gui de tao ma va gui lai ma cho nguoi nhan
	socket.on('receivertakecode', function(data1){

		if(data1.caller == MYID)
		{
			PARTNERID = data1.receiver
			console.log("ben nhan da chay")
			navigator.getUserMedia = navigator.getUserMedia ||
			                         navigator.webkitGetUserMedia ||
			                         navigator.mozGetUserMedia;
									 
			navigator.getUserMedia({ video: true, audio: true }, gotMedia, function () {})

			function gotMedia (stream) {

				var Peer = require('simple-peer')
				var peer1 = new Peer({initiator: false, trickle: false, iceTransportPolicy: 'relay',
					  config: {
				        iceServers: [
				          {
				            "urls": "stun:numb.viagenie.ca",
				            "username": 'phamvanlinh20111993@gmail.com',
				            "credential": 'a12345'
				          },
				          {
				            "urls": "turn:numb.viagenie.ca",
				            "username": "phamvanlinh20111993@gmail.com",
				            "credential": "a12345"
				          }
				        ]
				      },
						reconnectTimer: 300, stream : stream});
				console.log(peer1);

				console.log(data1.code)
				peer1.signal(JSON.parse(data1.code));
				//nguoi nhan tao ma
				peer1.on('signal', function(data) {
					console.log(data)
					console.log("nguoi nhan dã tao xong ma.")
					document.getElementById('key').value = JSON.stringify(data)

					if(typeof data.type !== 'undefined'){
						console.log(data.type)
						socket.emit('sendcodetocaller', {caller:data1.caller,receiver:data1.receiver,code:JSON.stringify(data)})
					}
				})
				
				 peer1.on('connect', function(){
      				console.log('Đã kết nối');
    			 });

    			 peer1.on('error', function (err) { console.log('error', err) })

				peer1.on('stream', function(stream){
					var video = document.querySelector('video');
					video.srcObject = stream;
					//video.play();
					var playPromise = video.play();

				   if (playPromise !== undefined) {
				      playPromise.then(_ => {
				      // Automatic playback started!
				      // Show playing UI.
				      })
				      .catch(error => {
				      // Auto-play was prevented
				      // Show paused UI.
				      });
				   }
				});
			}
		}

	})

	//end call
	document.getElementById("ketthuc").onclick = function(){
		socket.emit("signalendcall", {caller: PARTNERID, receiver:MYID, code:"end call"})
		window.close()
	}

/*document.getElementById("start").onclick = function(){
var Peer = require('simple-peer')
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia;
						 
// get video/voice stream
navigator.getUserMedia({ video: true, audio: true }, gotMedia, function () {})

function gotMedia (stream) {
	//var peer1 = new Peer({ initiator: location.hash === '#1', stream: stream })
	var peer1 = new Peer({ initiator: location.hash === '#1', trickle: false , stream : stream});
	//var peer2 = new Peer({ initiator: false,stream: stream });
	console.log(peer1);
	peer1.on('signal', function (data){
		//peer2.signal(data)
		console.log('fefefee');
		document.getElementById('key').value = JSON.stringify(data);
	})
  
	document.getElementById('submit').onclick = function(){
		console.log("create key to creater " +document.getElementById('key2').value);
		peer1.signal(JSON.parse(document.getElementById('key2').value));
	};
  
	//peer1.on('connect', function(){console.log('Đã kết nối'});
  
	peer1.on('stream', function(stream){
		var video = document.querySelector('video');
		video.srcObject = stream;
		video.play();
	});
}
} */