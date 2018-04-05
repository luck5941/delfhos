function FORM() {
	/*
	 *Modulo encargado de gestionar todas las entradas con el formulario
	*/
	this.newUser = (data) => {
		data.wallPaper = 'common/images/fsociety.jpg';
		ddbb.insert({user: data[0]});
	};
	this.login = (data, socket) => {
		console.log("------------------------------");
		console.log("login")
		console.log(data)
		let response = ddbb.query({user: data[0]});
		response.then((res) => {
			if (res.length < 1) 
				//console.log("no tiene acceso");
				modules.communication.send({access: false}, data[1], data[2], socket);
			else
				modules.communication.send({access: true}, data[1], data[2], socket);
		});
	};
};
module.exports = FORM;
