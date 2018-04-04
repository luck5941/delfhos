'use strict';
function DESKTOP(){	
	/*Importación de módulos */
	const fs = require('fs')
	const url = require('url');
	
	/*modulos propios*/
	var EventServer = require(process.env.PWD+'/commonModules/remoteEvent');
	EventServer = EventServer.Server
	/*Variables globales*/
	var configFile = __dirname + '/../../commonModules/config.json',
		appsPath = __dirname + '/../../',
		json = {},
		user = 'lucas'; //Esto se deberá cambiar más adelante

	function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}
	

	var updatebackgroundImg = () =>{	
		let bkgrUri = json['deskop_image'];
		fs.readFile(__dirname+'/public/css/style.css', 'utf8', (err, data) => {
			data = data.replace('%backgroundUri%', bkgrUri);
			fs.writeFile(__dirname+'/public/css/style_tmp.css', data, (err) => {
				if (err) return console.log(err);
			});
		});
	};
}
module.exports = DESKTOP;
