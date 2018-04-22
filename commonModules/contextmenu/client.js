'use strict';
function ContextMenu() {
	var body = $('body'),
		menu = {};
	this.menu = menu = {};
	var openMenu = (x, y, t) => {
		/*
		 *Esta funcion se encarga de mostrar el menún de acciones,
		 *ya definido en el dom.
		 *int x, y -> Las coordenadas que en que se tiene que crear
		 */
		if (!t) return null;
		menuVue.options = menu[t];
		menuVue.style = { "display": "block", "top": `${y}px`, "left": `${x}px` };
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
				return menuVue.style.display ="none";
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
						if ((join + e.currentTarget[search].replace(' ', join)).indexOf(t) != -1)
							return t;
					}
				})();
				return openMenu(e.pageX, e.pageY, target);
				break;
		};
	};

	this.updateMenu = (obj = Obj) => {
		for (let t in obj) {
			menu[t] = [];
			for (let o in obj[t]){
				let func = obj[t][o].split(".");
				menu[t].push({txt: o, func: `${t}_func_${func[1]}`});
				method[`${t}_func_${func[1]}`] = window[func[0]][func[1]];
			}
		}
		for (let o in obj) 	
			body.on('mousedown', o, cliked);
	};
};
let contextMenu =  new ContextMenu();
menuVue = {options: {}, style:{}},
method = {};
contextMenuVue = new Vue({el: '#contextMenu', data: menuVue, methods: {d:(data) => {method[data](); menuVue.style.display = "none";}}});
