'use strict';
function modal(html = '', app = []) {
	/*
	 *Modulo encargado de solicitar y organizar el el contenido html necesario para la
	 *generación de un "programa" nuevo
	 *html: platilla que se usa para la creación del modal, es decir, la ruta al archivo
	 *del que se parte para generar el contendido final.
	 *Por defecto está vacio ya que lo normal será generar modulos ya definidos de forma
	 *independiente.
	 *  app:[String]  -> Contiene el nombre de la aplicación y si los modulos
	 *  o pluggins extras que no se cargan por defecto, pero si en esta ocasión. 
	*/
	let sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));
	let toLoad = (typeof html === 'string') ? html : app;
	this.openApps(args) => {
		console.log("en el modal");
		console.log(args);
		console.log(modules);
		let l  = new modules["LoadApp"](`${__dirname}/../${toLoad}/`, toLoad);
		m = l.secuence();
		m.then((a) => {console.log(a);});

	};
};
module.exports = modal;
