function Chat(id) {
	this.id = id;
	this.chats = []
	init = async () => {
		/*
		 *Metodo encargado de hacer las peticiones necesarias a la ddbb para gestionar
		 *el inicio del chat de forma correcta
		*/
		console.log("ey!");
		this.user = session[this.id].user;		
		ddbb.query({user: {'user': this.user}}, {_id: 0, chats: 1}).then((d)=> {
			console.log(d[0]);
			this.chats = d[0].chats;
		});
	};
	this.getInit = (data, socket) => {
		let toSend = [{user: this.user, chats: this.chats}];
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

	init();
};

module.exports = Chat;
