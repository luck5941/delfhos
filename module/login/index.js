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
	this.login = (data, socket) => {
		let response = ddbb.query({user: data[0]});
		let id;
		response.then((res) => {
			if (res.length < 1){ 
				modules.communication.send({access: false}, data[1], data[2], socket);
			}
			else{
				let key = '',
					now = new Date().getTime();
				res = res[0];
				id = now+res._id;
				id = crypto.createHash('sha256').update(id).digest('base64');
				session[id] = {};
				session[id]["register"] = true;
				session[id]["user"] = res.user
				modules.communication.send({access: true, key: id}, data[1], data[2], socket);
			}
		});
	};
};
module.exports = FORM;
