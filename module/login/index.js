function FORM() {
	/*
	 *Modulo encargado de gestionar todas las entradas con el formulario
	*/
	this.newUser = (data) => {
		data.wallPaper = 'common/images/fsociety.jpg';
		ddbb.insert({user: data[0]});
	};
	this.login = (data, socket) => {
		let response = ddbb.query({user: data[0]});
		let ip = socket.handshake.address.split(":").slice(-1)[0];
		response.then((res) => {
			res = res[0];
			if (res.length < 1){ 
				session[ip]["register"] = false;
				modules.communication.send({access: false}, data[1], data[2], socket);
			}
			else{
				session[ip]["register"] = true;
				session[ip]["user"] = res.user
				modules.communication.send({access: true}, data[1], data[2], socket);
			}
		});
	};
};
module.exports = FORM;
