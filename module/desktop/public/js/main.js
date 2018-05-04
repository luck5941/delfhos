'use strict'
var desktopScope = {};
/*variables globales*/
desktopScope.programs = $('desktop #downBar li');
desktopScope.home = $('desktop #home');
desktopScope.menu = $('desktop #menu');
desktopScope.profileLaunch = desktopScope.menu.find('#settings li').eq(0);
desktopScope.contentMenuConstruct = {"desktop": {"Cambiar la img": "desktopScope.changeImg"}}


//desktopScope.contentMenu = new ContentMenu(desktopScope.contentMenuConstruct);
/*modules externos*/
var external = {}


/*metodos locales*/
/*metodos  llamados por eventos*/
desktopScope.openModal = (e) => {
	/*
	 *Función encargada de mostrar el modal en la pantalla
	*/
	let txt = e.currentTarget.innerHTML.toLowerCase(),
		args = [];
	switch (txt){
		case 'filesystem':
			args = ['filesystem'];
			break;
		case 'perfil':
			args = ['filesystem', 'selectfile']; 
			desktopScope.why = (txt==='perfil') ? 'profilePicture':'';
			break;
		case 'chat':
			args = ['chat'];
			break;
		default:
			console.info("something went bad");
			break;
	}
	comunication.send('modal', args, 'openApps', 'changeImg','modal' );
};
desktopScope.openMenu = () => {
	let method =(desktopScope.menu.attr('class')) ? (desktopScope.menu.attr('class').search('visible') === -1) ? 'addClass' : 'removeClass' : 'addClass';
	desktopScope.menu[method]('visible');
};
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
desktopScope.programs.on('click',desktopScope.openModal);
desktopScope.home.on('click',desktopScope.openMenu);
desktopScope.profileLaunch.on('click', desktopScope.openModal);
contextMenu.updateMenu(desktopScope.contentMenuConstruct);
