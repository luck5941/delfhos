'use strict'
var desktopScope = {};
/*variables globales*/
desktopScope.programs = $();
desktopScope.menu = $('desktop #menu');
desktopScope.profileLaunch = desktopScope.menu.find('#settings li').eq(0);
desktopScope.contentMenuConstruct = {"desktop": {"Cambiar la img": "desktopScope.changeImg"}}
//variables de vue
desktopScope.vueData = {};
desktopScope.vueData.menuVisible =false;
desktopScope.vueData.openPrograms =[];
desktopScope.vueData.options =false;
let t = new Date();
desktopScope.vueData.hour =t.getHours().toString();
desktopScope.vueData.minutes =t.getMinutes().toString();
if (desktopScope.vueData.hour.length == 1) desktopScope.vueData.hour = '0'+desktopScope.vueData.hour;
if (desktopScope.vueData.minutes.length == 1) desktopScope.vueData.minutes = '0'+desktopScope.vueData.minutes;
//metodos de vue
desktopScope.vueMethods = {};
desktopScope.vueMethods.showOptions = () => desktopScope.vueData.options = !desktopScope.vueData.options;
desktopScope.vueMethods.openMenu = () => {desktopScope.vueData.menuVisible = !desktopScope.vueData.menuVisible; desktopScope.vueData.options = false;}; 
desktopScope.openModal = (e) => {
	/*
	 *Función encargada de mostrar el modal en la pantalla
	*/
	let txt = e.currentTarget.getAttribute('id'),
		args = [];
	switch (txt){
		case 'filesystem':
			args = ['filesystem'];
			break;
		case 'profilePicture':
			args = ['filesystem', 'selectfile']; 
			desktopScope.why = (txt==='perfil') ? 'profilePicture':'';
			break;
		case 'chat':
			args = ['chat'];
			break;
		default:
			return	console.info("something went bad");
			break;
	}
	comunication.send('modal', args, 'openApps', 'changeImg','modal' );
};
/*metodos locales*/
desktopScope.updateTime = async () => {
	let m =parseInt(desktopScope.vueData.minutes),
		h =parseInt(desktopScope.vueData.hour);
	while(true){
		await sleep(60000);
		if (++m ==60){
			m = 0;
			if (++h==24) h=0;
		}
		desktopScope.vueData.hour =h.toString();
		desktopScope.vueData.minutes =m.toString();
		if (desktopScope.vueData.hour.length == 1) desktopScope.vueData.hour = '0'+desktopScope.vueData.hour;
		if (desktopScope.vueData.minutes.length == 1) desktopScope.vueData.minutes = '0'+desktopScope.vueData.minutes;
	}
};

/*metodos  llamados por eventos*/
desktopScope.changeImg = () => {
	/*
	 *Función encargada de mostrar llamar al filesystem con la intención de poder cambiar la img de fondo
	*/
	desktopScope.why = 'wallPaper';
	comunication.send('modal', ['filesystem', 'selectfile'], 'openApps', 'changeImg','modal' );
};
desktopScope.updateImg = (uri) => {
	uri = `url("${uri[0]}")`
	switch (desktopScope.why) {
		case 'wallPaper':
			selection = $('desktop');
			break;
		case 'profilePicture':
			selection = $('#profilePicture')
			break;
		default:
			console.log(desktopScope.why);
			return;
	}
	selection.css({"background-image": uri});
	interaction.specialAction(['filesystem', 'close']);
}
/*control de eventos*/
$('body')
.on('click', '#menu #programsList li', desktopScope.openModal)
.on('click', '#menu #options #profilePicture', desktopScope.openModal);
contextMenu.updateMenu(desktopScope.contentMenuConstruct);
desktopScope.updateTime();
desktopScope.vue = new Vue({'el': 'desktop', data: desktopScope.vueData, methods: desktopScope.vueMethods});
