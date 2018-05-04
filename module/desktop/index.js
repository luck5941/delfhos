'use strict';
function DESKTOP(id){
	this.id = id;
	/*modulos propios*/
	var EventServer = require(process.env.PWD+'/commonModules/remoteEvent');
	EventServer = EventServer.Server
	/*Variables globales*/
	function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}
	let replace = (str, rx, rplc = '') => {
		/*
		 * metodo encargado de replazar una regex por otro string en un obj o en un string.
	 	 * Puedes determinar si te devuelve el string u obj alterado o lo no lo modifica.
		 * str:string;
		 * rx: regex;
		 * rpl: string -> sirve para sustituir en el string el match, para que no se quede en un bucle
		 * flag: si flag es true, se altera el diccionario si es false, no
		*/
		let match = [], p;
		while( p = rx.exec(str)){
			match.push(p[1]);
			let type =  (typeof(rplc) === 'string') ? 'string': Array.isArray(rplc) ? 'array' : 'obj';
			str = (typeof(rplc) === 'string') ? str.replace(p[0], rplc) : Array.isArray(rplc) ? str.replace(p[0], rplc[cont]) : str.replace(p[0], ()=> (rplc[p[1]]) ?rplc[p[1]] :'');
		}
		return [match, str];
	};
	/* metodos publicos */
	this.customize = async (obj, id) => {
		/*function encargada de determinar si hay que cambiar algo del
		 *texto que se va a enviar al usuario
		 *antes de que este sea enviado
		 * obj {key:String} Contiene todo el texto
		*/
		let toSearch = replace(obj.css, /\%(\w*)\%/)[0],
			toQuery = {"_id": 1};
		for (let t of toSearch)
			toQuery[t] = 1;
		let path = await  ddbb.query({user: {'user': session[id].user}}, toQuery);
		session[id]["_id"] = path[0]._id;
		obj.css = replace(obj.css, /\%(\w*)\%/, path[0])[1];
		return obj;
	};
}
module.exports = DESKTOP;
