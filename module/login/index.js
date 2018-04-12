function FORM() {
	/*
	 *Modulo encargado de gestionar todas las entradas con el formulario
	*/
	const fs = require('fs');
	this.newUser = (data) => {
		data[0].wallPaper = 'common/images/fsociety.jpg';
		ddbb.insert({user: data[0]});
		fs.mkdir(`files/users/${data[0].user}`, (e) => (e) ? console.error(e) : null);
	};
	this.login = (data, socket) => {
		let response = ddbb.query({user: data[0]});
		let ip = socket.handshake.address.split(":").slice(-1)[0];
		response.then((res) => {
			if (res.length < 1){ 
				session[ip]["register"] = false;
				modules.communication.send({access: false}, data[1], data[2], socket);
			}
			else{
				res = res[0];
				session[ip]["register"] = true;
				session[ip]["user"] = res.user
				modules.communication.send({access: true}, data[1], data[2], socket);
			}
		});
	};
};
module.exports = FORM;
