
function Client(win) {
    var socket = io('http://192.168.1.9:8080');
    socket.on('event', function(args) {
        win[args[0]](args[1]);
    });
    this.send = function(event, args, funt1, context) {
    	/*
		 * función encarga de gestionar como enviar los datos y a donde
		 * event:String -> El nombre que del evento que recive el servidor
		 * args:[any] -> Contiene toda la información que se le quiera enviar 
		 * funt1:Function -> motivo por el que se envían los datos 
		 * context:String -> callback de respuesta (debe de estar dentro del objeto external)
    	*/

        socket.emit(event, [args, funt1, context]);
    };
};
var external = {};