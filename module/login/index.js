function FORM() {
	/*
	 *Modulo encargado de gestionar todas las entradas con el formulario
	*/
	const fs = require('fs');
	const crypto = require('crypto');
	this.newUser = (data) => {
		data[0].wallPaper = 'common/images/fsociety.jpg';
		ddbb.insert({user: data[0]});
		fs.mkdir(`files/users/${data[0].user}`, (e) => (e) ? console.error(e) : null);
	};
	this.getSession = (ip) => {
		/*
		 * metodo encargado de determinar que variable de session debe tener asignada en función de la cookie y la ip en el momento del login
		 *ip: string
		 *cokie: string
		*/
		
	};
	this.login = (data, socket) => {
		let obj = {};
		for (let o in data[0])
			if (o !== 'id')
				obj[o] = data[0][o];
		let response = ddbb.query({user: obj});
		let id = modules.server.getCookieValue(data[0].id, "_id");
		let ip = socket.handshake.address.split(":").slice(-1)[0];
		response.then((res) => {
			if (res.length < 1){ 
				session[ip+"_"+id].register  = false;
				modules.communication.send({access: false}, data[1], data[2], socket);
			}
			else{
				let key = '';
				session[ip+"_"+id]["register"] = true;
				session[ip+"_"+id]["user"] = res[0].user
				modules.communication.send({access: true, key: id}, data[1], data[2], socket);
			}
		});
	};
};
module.exports = FORM;
