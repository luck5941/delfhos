
'use strict'
alert("something")
/*
var Whatch =  require('./../../../commonModules/watcher');*/
var desktopScope = {};
// var desktopScopeWatch = new Whatch(desktopScope);
/*variables globales*/
desktopScope.body = $('body'),
desktopScope.input = $('input'),
desktopScope.menu = $('#contentMenu'),
desktopScope.menu_open = false,
desktopScope.options = $('.options'),
desktopScope.modal = $('#modal');
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
desktopScope.openModal = () => {
	/*
	 *Función encargada de mostrar el modal en la pantalla
	*/	
	comunication.send('openApps', 'changeImg', ['fileSystem', 'selectfile']);
};


/*metodos locales llamados por eventos*/
desktopScope.cliked = (e) => {
	/*
	 *Se encarga de registrar los clicks que tiene lugar en el escritorio.
	 *Si es con el derecho, llama a openMenu, en caso de ser con el izquierdo
	 *lo oculta, sin necesidad de llamar a otra función que lo haga.
	 *x e y son las coordenadas en las que tiene que aparecer el menú
	*/	
	var	x = e.offsetX,
		y = e.offsetY;	
	return (e.which === 1) ? desktopScope.menu.removeAttr('style') : (e.which === 3) ? desktopScope.openMenu(x, y) : null;
};
desktopScope.changeImg = ()=>{	
	console.log("aquí no!")
}
/*control de eventos*/
desktopScope.body.on('mousedown', desktopScope.cliked);
$(desktopScope.options).on('mousedown', desktopScope.openModal);
$(desktopScope.input[1]).on('mousedown', desktopScope.changeImg);
var comunication = new remoteevent.Client(external);