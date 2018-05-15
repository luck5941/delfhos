var users = {
	id_users: 0,
	user: "",
	name: "",
	lastName: "",
	wallPaper: "",
	profilePicture: "",
	friends: [0],
	lastpwd: "",
	phoneNumber: 0,
	
};
var chats ={
	id_chats: 0,
	members: []
	messages: [{
		to: 0,
		from: 0,
		time: new Date(),
		message: ""
	}]
};
/*
*apuntes mongodb
listar todas las bases de datos:
db.adminCommand({listDatabases: 1});
Crear una base de datots:
use <dabaseName> //Sirve para usar la base de datos, si no existe, la crea

*/
