'use strict'
/*
var Whatch =  require('./../../../commonModules/watcher');*/
var desktopScope = {};
// var desktopScopeWatch = new Whatch(desktopScope);
/*variables globales*/
desktopScope.programs = $('desktop #downBar li');
desktopScope.contentMenuConstruct = {"desktop": {"Cambiar la img": "desktopScope.changeImg"}}
//desktopScope.contentMenu = new ContentMenu(desktopScope.contentMenuConstruct);
/*modules externos*/
var external = {}


/*metodos locales*/
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
		case 'cambiar la img':
			args ['filesystem', 'selectfile']; 
			break;
		default:
			console.log("something went bad");
	}
	console.log("vamos a enviar las coasa")
	comunication.send('modal', args, 'openApps', 'changeImg','modal' );
};
desktopScope.changeImg = () => {
	/*
	 *Función encargada de mostrar llamar al filesystem con la intención de poder cambiar la img de fondo
	*/
	comunication.send('modal', ['filesystem', 'selectfile'], 'openApps', 'changeImg','modal' );
};
desktopScope.updateImg = (uri) => {
	uri = `url("${uri[0]}")`
	$('desktop').css({"background-image": uri})
	selecFileScope = undefined;
	mainScope = undefined;
	$('filesystem').addClass("minify").html("");
}
/*metodos locales llamados por eventos*/
/*control de eventos*/
desktopScope.programs.on('click',desktopScope.openModal);
contextMenu.updateMenu(desktopScope.contentMenuConstruct);
