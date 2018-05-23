function FORM() {
	/*
	 *Modulo encargado de gestionar todas las entradas con el formulario
	*/
	const fs = require('fs');
	const crypto = require('crypto');
	this.newUser = (data, socket) => {
		/*
		 *Metodo encargado de responder a las peticiones de creación de un nuevo usuario
		 *Establece unos valores minimos como pueda ser la img de fondo, de perfil, la creación de elementos asociados al usuario.. etc.
		 *En caso de no tener los elementos mínimos para crearse, se sale de la función, es decir:
		 *[user, birthday,mail,password]
		 *y no puede incluir elementos distintos a:
		 *[user,name,lastname,birthday,mail,secondMail,phoneNumber,password]
		*/
		let base = ["user","name","lastname","birthday","mail","secondMail","phoneNumber","password"],
			req = ["user", "birthday","mail","password"],
			r =0;
		for (let o of Object.keys(data[0])){
			if(req.indexOf(o) !==-1)r++;
			if (base.indexOf(o) === -1) return modules.communication.send({access: 'missingValue'}, data[1], data[2], socket);
		}
		if (r!== req.length) return modules.communication.send({access: 'excessOfData'}, data[1], data[2], socket);
		data[0].wallPaper = 'common/images/fsociety.jpg';
		data[0].profilePicture = 'common/images/newUser.png';
		data[0].friends = [];
		let answer = ddbb.insert({user: data[0]}),originPath = __dirname.split("/").slice(0, -2).join("/")+'/files/'+data[0].profilePicture;
		answer.then((d) =>{
			if (d == 11000){ 
				console.info("ya existe");
				modules.communication.send({access: 'itExist'}, data[1], data[2], socket);
			}
			else{
				fs.symlink(originPath, `${__dirname}/../../files/profile/${data[0].user}`, (e)=> (e) ? console.error(e):null);
				fs.mkdir(`files/users/${data[0].user}`, (e) => {
					if (e) return console.error(e);
					fs.mkdir(`files/users/${data[0].user}/.trash`, (e) => (e) ? console.error(e) : null);
					fs.mkdir(`files/users/${data[0].user}/Compartido`, (e) => (e) ? console.error(e) : null);
					fs.mkdir(`files/users/${data[0].user}/Documentos`, (e) => (e) ? console.error(e) : null);
					fs.mkdir(`files/users/${data[0].user}/Música`, (e) => (e) ? console.error(e) : null);
					fs.mkdir(`files/users/${data[0].user}/Imágenes`, (e) => (e) ? console.error(e) : null);
					fs.mkdir(`files/users/${data[0].user}/Videos`, (e) => (e) ? console.error(e) : null);
					modules.communication.send({access: 'register'}, data[1], data[2], socket);
				});
			}
		});
	};
	this.login = (data, socket) => {
		let obj = {},
			keys = Object.keys(data[0]).sort().join(' ');
		if (keys !== 'id password user') return console.log(keys)
		for (let o in data[0])
			if (o !== 'id')
				obj[o] = data[0][o];
		let response = ddbb.query({user: obj}, {"user": 1, "_id": 0});
		let id = modules.server.getCookieValue(data[0].id, "_id");
		let ip = socket.handshake.address.split(":").slice(-1)[0];		
		response.then((res) => {
			if (res.length !== 1){ 
				session[ip+"_"+id].register  = false;
				modules.communication.send({access: false}, data[1], data[2], socket);
			}
			else{
				let key = '';
				session[ip+"_"+id]["register"] = true;
				session[ip+"_"+id]["user"] = res[0].user
				modules.communication.send({access: true}, data[1], data[2], socket);
			}
		});
	};
};
module.exports = FORM;
