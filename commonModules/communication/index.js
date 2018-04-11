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
			let ip = socket.handshake.address.split(":").slice(-1)[0],
				toSend = [data[0], data[3], data[4]],
			 	instanceName = `${ip}_${data[1]}`;
			console.log(instances);
			instances[instanceName].slice(-1)[0][data[2]](toSend, socket);
		});
		socket.on('ipc', (data) => {
			console.log("se le pasa el socket a "+data.slice(-1));
			console.log("en la función "+ data[1]);
			console.log(data[0]);
			console.log("-----------------");
			modules[data.slice(-1)[0]][data[1]](data[0], socket);
		});
	});
	this.send = (args, context,funct, socket) => {
		let parameters = [args, context, funct]
		socket.emit('event', parameters);	
	}
};
module.exports = COMUNICATION
