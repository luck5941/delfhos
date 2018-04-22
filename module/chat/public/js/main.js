var chatScope = {};
chatScope.data = {userName: "", chats: [], searchChats: [], chat:false, messages: [], nick: "", message: "", activeChat:""};
chatScope.to = '';
chatScope.messages = {};
chatScope.init = (data) => {
	/*
	 *Función encarga de preguntar por los valores iniciales al backend
	*/	
	chatScope.data.userName = data[0].user;
	chatScope.data.chats = data[0].chats;
	chatScope.messages = data[0].messages;
}
chatScope.listUsers = (data) => {	
	chatScope.data.searchChats = data;
};
chatScope.printMessage = (data) => {
	/*
	 * función encargada de recibir los nuevos mensajes, ya sea del chat activo o de otros chats
	*/
	if (!chatScope.data.chats.some((d)=>d.user === data.from))
		chatScope.data.chats.push({user: data.from, photo: data.photo});	
	if (!chatScope.messages[data.from])
		chatScope.messages[data.from] = [];
	chatScope.data.activeChat =data.from;
	chatScope.messages[chatScope.data.activeChat].push({"text": data.txt});
	chatScope.data.messages = chatScope.messages[chatScope.data.activeChat];
	chatScope.moveScroll();
};

chatScope.moveScroll = async () => {
	let lenght = $("#chatArea").find('div').length;
	console.log(lenght)
	while (lenght === $("#chatArea").find('div').length){
		await sleep(1);
	};
	$('#chatArea').scrollTop($('#chatArea')[0].scrollHeight);
}

/*metodos locales llamados por eventos*/

chatScope.searchUser = () => comunication.send('event', [chatScope.data.nick], 'chat', 'searchUser', 'chatScope', 'listUsers');

chatScope.openChat = (to) => {
	/*
	 * Función encargada de gestioar un nuevo chat, tanto de crearlo en la bbdd
	 * y llamar a la función encargada de adapatar el entorno a un chat
	*/
	
	chatScope.data.chat = true;	
	chatScope.data.activeChat = to;
	chatScope.data.nick = "";
	chatScope.data.searchChats = [];
	if (!chatScope.messages[to])
		chatScope.messages[to] = [];
	chatScope.data.messages =chatScope.messages[to]; 
}

chatScope.sendMessage = (e) => {
	if (e.keyCode !== 13) return;	
	chatScope.messages[chatScope.data.activeChat].push({text: chatScope.data.message, own: true});
	chatScope.data.messages = chatScope.messages[chatScope.data.activeChat];
	comunication.send('chat', {dst: chatScope.data.activeChat, text: chatScope.data.message});
	chatScope.data.message = "";
	chatScope.moveScroll();
};

chatScope.vue = new Vue({el: "chat",data: chatScope.data, methods: {
	openChat: chatScope.openChat,
	searchUser: chatScope.searchUser,
	sendMessage: chatScope.sendMessage
}})
$(document).ready(()=> comunication.send('event', [''], 'chat', 'getInit', 'chatScope', 'init'));