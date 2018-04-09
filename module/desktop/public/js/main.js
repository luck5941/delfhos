'use strict'
/*
var Whatch =  require('./../../../commonModules/watcher');*/
var desktopScope = {};
// var desktopScopeWatch = new Whatch(desktopScope);
/*variables globales*/
desktopScope.programs = $('desktop #downBar li');
desktopScope.contentMenuConstruct = {"desktop": {"Cambiar la img": "desktopScope.changeImg"}}
desktopScope.contentMenu = new ContentMenu(desktopScope.contentMenuConstruct);
/*modules externos*/
var external = {}

external.changeImg = (args) => {
	if (args)
	body.css('background-image', `url(${args})`);
};

/*metodos locales*/
desktopScope.openModal = (e) => {
	/*
	 *Función encargada de mostrar el modal en la pantalla
	*/
	let txt = e.currentTarget.innerHTML.toLowerCase(),
		args = [];
	console.log(txt);
	switch (txt){
		case 'filesystem':
			args = ['filesystem'];
			break;
		case 'cambiar la img':
			args ['filesystem', 'selectfile']; 
			break;
		default:
			console.log("something went bad");
	}
	comunication.send('ipc', args, 'openApps', 'changeImg','modal' );
	console.log("Quieren abrir un programa");
};
desktopScope.changeImg = () => {
	/*
	 *Función encargada de mostrar llamar al filesystem con la intención de poder cambiar la img de fondo
	*/
	comunication.send('ipc', ['filesystem', 'selectfile'], 'openApps', 'changeImg','modal' );
	console.log("Quieren cambiar la img");
};
/*metodos locales llamados por eventos*/
/*control de eventos*/
desktopScope.programs.on('click',desktopScope.openModal);
 
