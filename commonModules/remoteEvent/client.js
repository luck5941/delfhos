
function Client() {
	var socket = io('http://192.168.1.9:8080');
	socket.on('event', function(args) {
		//win[args[0]](args[1]);
		console.log(args);
		window[args[1]][args[2]](args[0])
	});
	socket.on('modal', function(args) {
		modalScope.generate(args);
	});
	this.send = function(event, args, where, funt1, context, who) {
    		/*
		 * función encarga de gestionar como enviar los datos y a donde
		 * event:String -> El nombre que del evento que recive el servidor
		 * args:[any] -> Contiene toda la información que se le quiera enviar 
		 * where:string ->  modulo encargado de gestionar de recivir los datos
		 * funt1:String -> función encargada de procesar los datos que se revciven 
		 * context:String -> callback de respuesta (debe de estar dentro del objeto external)
		 * who: string -> quien debe ejecutar el callback
    		*/
		console.log(context);
		let parameters = [args, where, funt1, context];
		if (who) parameters.push(who);
		console.log(parameters);
		socket.emit(event, parameters);
	};
};
var external = {};
