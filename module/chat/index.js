function Chat(id, socket) {
	this.id = id;
	this.chats = {};
	this.socket = {};
	init = async () => {
		/*
		 *Metodo encargado de hacer las peticiones necesarias a la ddbb para gestionar
		 *el inicio del chat de forma correcta
		*/
		
		this.user = session[this.id].user;		
		ddbb.query({user: {'user': this.user}}, {_id: 0, chats: 1}).then((d)=> {		
			this.chats = d[0].chats;
		});
	};
	this.getInit = (data, socket) => {
		let toSend = [{user: this.user, chats: this.chats}];
		this.socket = socket;
		modules.communication.send(toSend, data[1], data[2], socket);
	};
	this.searchUser = (data, socket) => {
		/*
		 * metodo encargado de buscar por los usuarios que coincidan con el patron que se pasa en data[0][0]
		*/
		if (!data[0][0])
			return modules.communication.send([], data[1], data[2], socket);
		let patern = `^${data[0][0]}`
		reg = new RegExp(patern, 'i');
		ddbb.query({user: {user: reg}}, {"_id": 0, "user": 1}).then((d) => {			
			let toSend = [];
			let obj;
			for (let i of d){
				obj = {};
				obj.user = i.user;
				obj.profilePhoto = i.profilePhoto;
				toSend.push(obj);
			}
			modules.communication.send(toSend, data[1], data[2], socket);
		});
	};
	this.getMessage = (data) => {
		console.log(`soy ${this.user} y he recibido un mensaje de ${data.from} que dice: ${data.txt}`)
		this.socket.emit('chat', data);
	};

	this.newMessage = (message) => {
		/*
		 *metodo encargado de enviar el mensaje al resto de destinatarios
		*/

		let send = ''
		for (let o in session)
			if (session[o].user === message.dst){
				send = o;
				continue;
			}
		data = {from: this.user, txt: message.text}
		send = `${send}_chat`;
		if (Object.keys(instances).indexOf(send) !== -1)
			instances[send].slice(-1)[0].getMessage(data);
		ddbb.insert({"chats": {to: message.dst, from: this.user, time: new Date(), message: data.txt}});

	}

	init();
};

module.exports = Chat;
