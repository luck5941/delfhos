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
desktopScope.openMenu = (x, y) => {
	/*
	 *Esta funcion se encarga de mostrar el menún de acciones,
	 *ya definido en el dom.
	 *int x, y -> Las coordenadas que en que se tiene que crear
	*/	
	desktopScope.menu.css({"display": "block", "top": `${y}px`, "left": `${x}px`});
};
desktopScope.openModal = (e) => {
	/*
	 *Función encargada de mostrar el modal en la pantalla
	*/	
	comunication.send('ipc', ['filesystem', 'selectfile'], 'openApps', 'changeImg','modal' );
	console.log("Quieren abrir un programa");
};
/*metodos locales llamados por eventos*/
/*control de eventos*/
desktopScope.programs.on('click',desktopScope.openModal);
 
