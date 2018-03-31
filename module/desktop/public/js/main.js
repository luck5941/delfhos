'use strict'
/*librerias*/

console.log("0 fallos")
/*var EventClient = require('./../../../commonModules/localEvent').Client;
var $ = require('./../../../commonModules/jquery');
var Whatch =  require('./../../../commonModules/watcher');*/
var mainScope = {};
// var mainScopeWatch = new Whatch(mainScope);
/*variables globales*/
var body = $('body'),
	input = $('input'),
	menu = $('#contentMenu'),
	menu_open = false,
	options = $('.options'),
	modal = $('#modal');

/*modules externos*/
var external = {}

external.changeImg = (args) => {
	if (args)
	body.css('background-image', `url(${args})`);
};

/*metodos locales*/
var openMenu = (x, y) => {
	/*
	 *Esta funcion se encarga de mostrar el menún de acciones,
	 *ya definido en el dom.
	 *int x, y -> Las coordenadas que en que se tiene que crear
	*/	
	menu.css({"display": "block", "top": `${y}px`, "left": `${x}px`});
};
var openModal = () => {
	/*
	 *Función encargada de mostrar el modal en la pantalla
	*/	
	comunication.send('openApps', 'changeImg', ['fileSystem', 'selectfile']);
};


/*metodos locales llamados por eventos*/
var cliked = (e) => {
	/*
	 *Se encarga de registrar los clicks que tiene lugar en el escritorio.
	 *Si es con el derecho, llama a openMenu, en caso de ser con el izquierdo
	 *lo oculta, sin necesidad de llamar a otra función que lo haga.
	 *x e y son las coordenadas en las que tiene que aparecer el menú
	*/	
	var	x = e.offsetX,
		y = e.offsetY;	
	return (e.which === 1) ? menu.removeAttr('style') : (e.which === 3) ? openMenu(x, y) : null;
};
var changeImg = ()=>{	
	console.log("aquí no!")
}
/*control de eventos*/
body.on('mousedown', cliked);
$(options).on('mousedown', openModal);
$(input[1]).on('mousedown', changeImg);
var comunication = new EventClient(external);

