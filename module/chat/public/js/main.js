var chatScope = {};
chatScope.onInit = () => {
	if (!chatScope.vueData) chatScope.vueData = {};
	chatScope.vueData.userName= "";
	chatScope.vueData.chats= [];
	chatScope.vueData.searchChats= [];
	chatScope.vueData.chat=false;
	chatScope.vueData.messages= [];
	chatScope.vueData.nick= "";
	chatScope.vueData.message= "";
	chatScope.vueData.activeChat="";
	chatScope.vueData.isSearching = false;
	chatScope.vueData.chatPending = '';
	chatScope.to = '';
	chatScope.messages = {};
};
/*Vue mehthods*/
chatScope.vueMethods = {};
chatScope.vueMethods.startSearch = () => chatScope.vueData.isSearching = !chatScope.vueData.isSearching;
chatScope.vueMethods.openChat = (to) => {
	/*
	 * Función encargada de gestioar un nuevo chat, tanto de crearlo en la bbdd
	 * y llamar a la función encargada de adapatar el entorno a un chat
	*/
	chatScope.vueData.isSearching = false;
	chatScope.vueData.chat = true;
	chatScope.vueData.activeChat = to;
	chatScope.vueData.nick = "";
	chatScope.vueData.searchChats = [];
	if (!chatScope.messages[to]) chatScope.messages[to] = [];
	if (chatScope.messages[to].some((d) => !d.readder)) if(--chatScope.vueData.chatPending === 0) chatScope.vueData.chatPending = '';
	//chatScope.messages[to].forEach((d, i) => chatScope.messages[to][i].readder = true);
	for (let o in chatScope.messages[to])
		chatScope.messages[to][o].readder = true;
	chatScope.vueData.messages = chatScope.messages[to]; 
	chatScope.vueData.chats.find((a) => a.user === to).number = '';
	comunication.send('event', [to], 'chat', 'setReadder');
}
chatScope.vueMethods.searchUser = () => comunication.send('event', [chatScope.vueData.nick], 'chat', 'searchUser', 'chatScope', 'listUsers');
chatScope.vueMethods.sendMessage = (e) => {
	if (e.keyCode !== 13) return;
	chatScope.messages[chatScope.vueData.activeChat].push({text: chatScope.vueData.message, own: true, time: new Date()});
	chatScope.vueData.messages = chatScope.messages[chatScope.vueData.activeChat];
	comunication.send('chat', {dst: chatScope.vueData.activeChat, text: chatScope.vueData.message});
	chatScope.vueData.message = "";
	chatScope.moveScroll();
};
chatScope.vueMethods.showChats = () => {
	chatScope.vueData.chat = false;
	chatScope.vueData.activeChat="";
	chatScope.to = '';
	chatScope.vueData.isSearching = false;
};
/*Normal methods*/
chatScope.onClose = () => {
	chatScope.isClosing = true;
	comunication.send('appCicle', 'close','filesystem');
};
chatScope.init = (data) => {
	/*
	 *Función encarga de preguntar por los valores iniciales al backend
	*/	
	chatScope.vueData.userName = data[0].user;
	chatScope.vueData.chats = data[0].chats;
	chatScope.messages = data[0].messages;
	let x = 0, c= 0;
	for (let o in chatScope.messages){
		if (chatScope.messages[o].some((a) => !a.readder)) {
			x++;
			c = chatScope.messages[o].filter((e) => !e.readder && !e.own);
			chatScope.vueData.chats.find((a) => a.user === o).number = (c.length !==0) ? c.length : '';
		}
		
	}
	chatScope.vueData.chatPending = x>0 ? x :'' ;
	
};
chatScope.listUsers = (data) => {	
	chatScope.vueData.searchChats = data;
};
chatScope.printMessage = (data) => {
	/*
	 * función encargada de recibir los nuevos mensajes, ya sea del chat activo o de otros chats
	 * Se pueden dar las siguientes causisiticas:
	 *	No tuviese ningún mensaje anterior de esa persona. En tal caso, se añade el chat a la lista de chats activos y se suma uno a la lista de mensajes pendientes
	 *	Lo tiene, no está activo y no tenia ningún mensaje previo sin leer suyo => Se suma uno a chats pendientes
	 *	Lo tiene, no está activo y ya tenia un mensaje anterior =>  Sólo le salta la notificación (pendiente de implementar)
	 *	Lo tiene y está activo -> Se marca inmediantamente como leido
	*/
	if (data.from === chatScope.vueData.activeChat) {
		comunication.send('event', [data.from], 'chat', 'setReadder');
		chatScope.messages[data.from].push({"text": data.txt, time: new Date(), readder: true});
		chatScope.vueData.messages = chatScope.messages[chatScope.vueData.activeChat];
		chatScope.moveScroll();
	}
	else {
		if (!chatScope.vueData.chats.some((d)=>d.user === data.from)){
			chatScope.vueData.chats.push({user: data.from, photo: data.photo});	
			chatScope.vueData.chatPending++;
		}
		else {
			if (chatScope.messages[data.from].every((d) => d.readder)) chatScope.vueData.chatPending++;
			else {
				chatScope.vueData.chats.find((d) => d.user === data.from).number++;
				chatScope.vue.$forceUpdate();
			}
		}
		chatScope.messages[data.from].push({"text": data.txt, time: new Date(), readder: false});
	}
};

chatScope.moveScroll = async () => {
	let lenght = $("#chatArea").find('div').length;
	while (lenght === $("#chatArea").find('div').length){
		await sleep(1);
	};
	$('#chatArea').scrollTop($('#chatArea')[0].scrollHeight);
}

/*metodos locales llamados por eventos*/



chatScope.onInit();
chatScope.vue = new Vue({el: "chat",data: chatScope.vueData, methods:chatScope.vueMethods});
$(document).ready(()=> comunication.send('event', [''], 'chat', 'getInit', 'chatScope', 'init'));
$('chat').find('header').removeAttr('move');
