'use strict';
const remoteevent = {
	Client : function(win){		
		var socket = io('http://delfhos.com');
		socket.on('event', function(args) {			
			win[args[0]](args[1]);
		});
		this.send = function (func1, func2, args){
			socket.emit('event', [func1, func2, args]);
		};
	},
	Server : function(win, app) {		
		this.win = win;
		const io = require('socket.io')(app);
		io.on('connection', function(socket)  {
			socket.on('event', function (args) {
				let toSend = win[args[0]](args[2]);				
				socket.emit('event', [args[1], toSend]);
			});
		});
	}
};
module.exports = remoteevent;