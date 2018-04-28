
function Client() {
	var socket = io('http://delfos');
	socket.on('event', function(args) {				
		window[args[1]][args[2]](args[0])
	}).on('modal', function(args) {
		modalScope.generate(args);
	}).on('chat', (data) => {
		chatScope.printMessage(data);
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
    	let parameters = []
    	
		if (event === 'event' || event === 'modal'){
			parameters = [args, where, funt1, context];
			if (who) parameters.push(who);
		}
		else if (event === 'chat')
			parameters = [args];
		socket.emit(event, parameters);
	};
};
var external = {};
