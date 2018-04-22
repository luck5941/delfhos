function Chat(id, socket) {
	this.id = id;
	this.chats = [];
	this.messages = {};
	this.socket = {};
	init =  () => {
		/*
		 *Metodo encargado de hacer las peticiones necesarias a la ddbb para gestionar
		 *el inicio del chat de forma correcta
		*/
		
		this.user = session[this.id].user;
		this._id  = session[this.id]["_id"];
		this.message = {};
		let match = ddbb.aggregate("chats", {$match: {members: {$in:[this._id]}}}, {$unwind: "$members"}, {$match: {members: {$ne:this._id}}}, {$lookup: {from: "user", localField: "members", foreignField: "_id", as: "user"}}, {$project: {"_id": 1, "messages":1, "user._id":1, "user.user":1}});
		match.then((d) => {
			for (let i in d){
					if (Object.keys(this.messages).indexOf(d[i].user[0].user)==-1){
							this.messages[d[i].user[0].user] = {id: d[i]._id, content: [], id_other: d[i].user[0]._id }
						}
					
					this.messages[d[i].user[0].user].content = d[i].messages;
					this.chats.push({user: d[i].user[0].user});
				}
			
		});
	};
	this.getInit = (data, socket) => {
		let msg = {}
		for (let o in this.messages){
			msg[o] = []
			for (let i of this.messages[o].content){
				let obj = {};
				obj.time = i.time;
				obj.text = i.message;
				obj.own = (i.from.toString() === this._id.toString())
				msg[o].push(obj)
			}
		}
		let toSend = [{user: this.user, chats: this.chats, messages: msg}];
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
		this.socket.emit('chat', data);
	};

	this.newMessage = (message) => {
		/*
		 *metodo encargado de enviar el mensaje al resto de destinatarios
		 *Primero busca a que socket debe enviar el mensaje, una vez que lo tenga,
		 genera la estructura que este debe enviar y actualiza en la base de datos
		*/
		
		if(Object.keys(this.messages).indexOf(message.dst) !== -1){ //exite el valor
			let id = this.messages[message.dst].id;
			this.messages[message.dst].content.push({from: this._id, to: this.messages[message.dst].id_other, time: new Date(), message: message.text});
			ddbb.update({"chats": {"_id": id}}, {messages: this.messages[message.dst].content})
		}
		else {
			ddbb.query({user: {user: message.dst}}).then((d)=> {
				let obj = {from: this._id, to: d[0]._id, time: new Date(), message: message.text};
				this.messages[message.dst] = {id_other: d[0]._id, content: [obj]}
		 		ddbb.insert({"chats": {members: [this._id, d[0]._id], messages: [obj]}}).then((d) => {
		 			this.messages[message.dst].id = d._id;
		 		});
			});
		}
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
	}

	init();
};

module.exports = Chat;
