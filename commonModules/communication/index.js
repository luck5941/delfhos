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
		socket.on('chat', (data) =>{
			let id =socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.split(":").slice(-1)[0]
			id+="_"+ modules.server.getCookieValue(socket.handshake.headers.cookie, '_id');
			let instanceName = `${id}_chat`
				instances[instanceName].slice(-1)[0]["newMessage"](data[0], socket);
		}).on('event', (data) => {
			let id =socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.split(":").slice(-1)[0]
			id+="_"+ modules.server.getCookieValue(socket.handshake.headers.cookie, '_id');
			let toSend = [data[0], data[3], data[4]],
			 	instanceName = `${id}_${data[1]}`;
			instances[instanceName].slice(-1)[0][data[2]](toSend, socket);
		}).on('modal', (data) => {
			modules[data.slice(-1)[0]][data[1]](data[0], socket);
		}).on('appCicle', (data) => {
			let id =socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.split(":").slice(-1)[0]
			id+="_"+ modules.server.getCookieValue(socket.handshake.headers.cookie, '_id');
			let instanceName = `${id}_${data[1]}`;
			let a = delete instances[instanceName];
			
		});
	});
	this.send = (args, context,funct, socket) => {
		/*
		 * función encargada de enviar datos al cliente  
		 * args: [any] Parametros que se envian a la función en cuestión
		 * context: String -> equivale al objeto que contiene la función a ejecutar
		 * funct: string -> La función que se debe ejecutar
		 * socket: Object -> el objeto con el que se permite el transpaso de información
		 * de un terminal a otro.
		*/
		
		let parameters = [args, context, funct];
		socket.emit('event', parameters);
	}
};
module.exports = COMUNICATION
