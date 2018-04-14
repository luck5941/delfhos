'use strict';
function DESKTOP(ip){	
	this.ip = ip;
	/*modulos propios*/
	var EventServer = require(process.env.PWD+'/commonModules/remoteEvent');
	EventServer = EventServer.Server
	/*Variables globales*/
	function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}
	var updatebackgroundImg = () =>{	
		let bkgrUri = json['deskop_image'];
		fs.readFile(__dirname+'/public/css/style.css', 'utf-8', (err, data) => {
			data = data.replace('%backgroundUri%', bkgrUri);
			fs.writeFile(__dirname+'/public/css/style_tmp.css', data, (err) => {
				if (err) return console.log(err);
			});
		});
	};
	/* metodos publicos */
	this.customize = async (obj, ip) => {
		/*function encargafa de determinar si hay que cambiar algo del
		 *texto que se va a enviar al usuario
		 *antes de que este sea enviado
		 * obj {key:String} Contiene todo el texto
		*/
		let path = await  ddbb.query({user: {'user': session[ip].user}}, {"_id": 0, "wallPaper": 1});
		path = path[0].wallPaper;
		obj.css = obj.css.replace('%backgroundUri%', path)
		return obj;
	};
	this.upgradeWallPaper = (data, socket) => {
		let ip = socket.handshake.address.split(":").slice(-1)[0],
			user = session[ip].user,
			path =`users/${user}${data[0][0]}`;
		ddbb.update({user: {user: user}}, {wallPaper: path});
		modules.communication.send([path], data[1], data[2], socket);
	};
}
module.exports = DESKTOP;
