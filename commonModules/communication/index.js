function COMUNICATION(){
	/*
	 *Modulo encargado de gestionar las comunicación que le llega al servidor por parte
	 *de los diferentes clientes.
	 *Con el nombre del evento, determina a que otro módulo se lo debe pasar.
	 *La lista de los posibles que le pueden llegar es:
	 *	ipc -> Todas las conexiones que se harían por este sistema de comunicación
	 *		a la hora de desarrollar software, es decir, las conexiones del front-end
	 *		con el back-end en cuanto a comando.
	 *	chat -> Todos los mensajes que llegan desde el chat.
	 *	tic_tac -> Mensajes generados en el uso del juego seudonimo para la comunicación entre
	 *		los dos participantes.
	 *	form -> Mensajes generados al enviar datos en el formulario.
	*/
	const io = require('socket.io')(global.app);
	let connected = [];
	io.on('connection', (socket) => {
		connected.push(socket);
		// console.log("se conecta con la ip:")
		// console.log(socket.handshake.address)
		socket.on('form', (data) => {
			console.log(data[1])
			console.log(modules.login)
			modules.login[data[1]](data[0]);
		});
		socket.on('ipc', (data) => {
			modules[data.slice(-1)[0]][data[1]](data[0], socket);
		});
	});
};
module.exports = COMUNICATION
