var chatScope = {};
chatScope.data = {userName: "", chats: []};
chatScope.vue = new Vue({el: "chat",data: chatScope.data})

chatScope.init = (data) => {
	/*
	 *Función encarga de preguntar por los valores iniciales al backend
	*/
	console.log(data[0])
	chatScope.data.userName = data[0].user;
	chatScope.data.chats = data[0].chats;
}
chatScope.listUsers = (data) => {
	chatScope.data.chats = data
};

/*metodos locales llamados por eventos*/

chatScope.searchUser = (e) => {
	let val = $(e.currentTarget).val()
	console.log("vamos a buscar por:"+ val);
	comunication.send('event', [val], 'chat', 'searchUser', 'chatScope', 'listUsers')

}
$("body")
.on('keyup', "#search", chatScope.searchUser);


$(document).ready(()=> comunication.send('event', [''], 'chat', 'getInit', 'chatScope', 'init'));

