var users = {
	id_users: 0,
	name: "",
	pwd:"",
	groups: [0],
	lastpwd: "",
	chats: [0],
	share_innodes: [0],
	share_to_me: [0]
};
var chats ={
	id_chats: 0,
	members: [],
	storage: {
		to: 0,
		from: 0,
		time: new Date(),
		message: ""
	}
};
var files = {

};
var groups = {
	id_groups : 0;
	name: "",
	image: "",
	chat: false

};
/*
*apuntes mongodb
listar todas las bases de datos:
db.adminCommand({listDatabases: 1});
Crear una base de datots:
use <dabaseName> //Sirve para usar la base de datos, si no existe, la crea

*/