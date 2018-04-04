'use strict';
var ContentMenu = function(Obj = { 'body': { "opt1": "", "opt2": "realFun" } }) {
	console.log("contentMenu")
	var body = $('body'),
		menu = {};

	var openMenu = (x, y, t) => {
		/*
		 *Esta funcion se encarga de mostrar el menún de acciones,
		 *ya definido en el dom.
		 *int x, y -> Las coordenadas que en que se tiene que crear
		 */
		if (!t) return null;
		$('body').prepend(menu[t]);
		$("#contentMenu").css({ "display": "block", "top": `${y}px`, "left": `${x}px` });
	};
	var cliked = (e) => {
		/*
		 *Se encarga de registrar los clicks que tiene lugar en el escritorio.
		 *Si es con el derecho, llama a openMenu, en caso de ser con el izquierdo
		 *lo oculta, sin necesidad de llamar a otra función que lo haga.
		 *x e y son las coordenadas en las que tiene que aparecer el menú
		 */
		e.stopPropagation();		
		switch (e.which) {
			case 1:
				return $("#contentMenu").remove();
				break;
			case 2:
				return null;
				break;
			case 3:
				let target = (() => {
					for (let t in menu) {
						let property = t.match(/\W/);
						let join = (property) ? property[0] : "";
						let search = (join === ".") ? "className" : (join === "#") ? "id" : "localName";
						console.log(t)
						if (join + e.currentTarget[search].replace(' ', join).indexOf(t) !== -1)
							return t;
					}
				})();
				return openMenu(e.pageX, e.pageY, target);
				break;
		};
	};

	this.updateMenu = (obj = Obj) => {
		for (let t in obj) {
			menu[t] = '<div id="contentMenu" class=shadow><nav><ul>';
			for (let o in obj[t])
				menu[t] += `<li class="options" onClick="${obj[t][o]}()">${o}</li>`;
			menu[t] += '</ul></nav></div>';
		}
	};
	this.updateMenu();	
	for (let o in Obj) 	
		body.on('mousedown', o, cliked);
};
