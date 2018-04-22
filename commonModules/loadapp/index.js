var loadApp = function(path, name, toLoad = []) {
	/*
	 * Esta libreria se encarga:
	 * -Cargar el fichero de cofiguración
	 * -Generar los string con todos los modulos
	 *  que se tienen que importar según los plugins que tenga el usuario o
	 *  según que se reciva por argumento al llamar al programa.
	 *
	 * -Cuando genere los script mueve todos los archivos a la carpeta de .buffer
	 *  para cuando se cierre la app borrarlos y nunca afectar a los archivos
	 *  orifinales.
	 */
	const fs = require('fs');
	function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}
	this.config = {};
	this.ready = [false, false, 0];
	this.loadderPlugins = 1000;
	this.end = false;
	this.ProgramName = name;
	this.css = '';
	this.jsInit = '';
	this.jsEnd = '';
	this.filesToRead = [];
	this.encodingExtensionsFile = ['html'];
	this.toLoad = toLoad;
	this.bcknd = {};
	this.toReplace = {'js':{jsInit:"", middle: "", jsEnd: ""}, 'css':"", 'html':""}
	this.loadExternal = (css, where = 'css', place="middle") => {
		for (let s of css){
			let filePath = `${this.path}public/${s}`;
			filePath = this.__getJumpBack(filePath);
			let loadFile = (e, d) => {
				if (e) return console.error(e)
				if (where === 'css' || where === 'html')
					this.toReplace[where] += d.replace(/[\n\t\r]*\/\*#\ssourceMappingURL=(\w*\.?){3}[\n\t\r]*/, '');
				else if (where === 'js'){
					this.toReplace[where][place] += d.replace(/[\n\t\r]*module\.exports\s?=\s?\w*;?[\n\t\r]*$/, '');					
				}
				this.ready[2]++;
				if (this.config){
					let cond = (this.ready[2] === this.config[this.ProgramName].style.length + this.config[this.ProgramName].script.length+this.loadderPlugins);
					if (this.ready[0] && this.ready[1] && cond) {
						this.__updateFiles();
					}
				}
			};
			fs.lstat(filePath, (e, d) => {
				if (e){
					filePath = filePath.replace('public/', '');
				}
				fs.readFile(filePath, 'utf-8',loadFile);
			});
		}
	};
	this.__loadPlugins = (obj) => {
		/*
		 * Esta función se encarga de cargar los diferentes plugins
		 * que se hayan indicado en el fichero de
		 * de configuración, o que se hayan pasado por parametro.
		 * obj: Object -> Contiene toda la información del objeto que se
		 * necesita cargar.
		 */
		let module, path, where, name_fr, name_bk, findIt = true, uri ={ jsInit: [], jsEnd:[]};
		for (let o of obj) {
			if (this.loadderPlugins == 1000) this.loadderPlugins = 0;
			if (!o["load_default"] && this.toLoad.indexOf(o["name"]) === -1) continue;
			this.loadderPlugins++;
			path = (o["external_path"]) ? o["external_path"] : "";
			module = o["name"].split(".");
			if (module.length === 1) module.push("");
			else module[1] = "." + module[1];
			module[0] = path + module[0].toLowerCase();
			where = (o["at_init"]) ? "jsInit" : "jsEnd";
			if (o["difference_between_front_and_back"]) {
				if (o["place"].search(/^bo/) !== -1) this.loadderPlugins = this.loadderPlugins   + 1;
				if (o["place"].search(/^f|^bo/) !== -1) uri[where].push(module[0]+"/client.js");
				if (o["place"].search(/^ba|^bo/) !== -1){ 
					let name = `${o["name"].split(".").slice(-1)}_${name_bk}`;
					try {
						this.bcknd[name] = (module[1]) ? require(module[0])[module[1].slice(1)][name_bk] : require(module[0])[name_bk];
					}
					catch (e) {
						findIt = false;
					}
					if (!findIt) {
						let search = module[0].split("/").slice(1).join("/");
						try {
							this.bcknd[name] = (module[1]) ? require(search)[module[1].slice(1)][name_bk] : require(search)[name_bk];
						}
						catch (e) {
							console.error(`el módulo o libreria ${o["name"]} no se ha encontrado. Por favor, contacte con el adminsitrador del sistema`);
						}
					this.ready[2]++;
				}
			}
			} else {
				if (o["place"].indexOf("f") !== -1) uri[where].push(module[0]+"/client.js");
				else if (o["place"].indexOf("ba" !== -1)){
					this.bcknd[module[1]] = require(module[0])[module[1]];
					this.ready[2]++;
				}
			}
			if (o["exec"] && (o["place"].indexOf("f") !== -1 || o["difference_between_front_and_back"]))
				this[where] += `${o["name"].split(".").slice(-1)}_${name_fr}()`
			if (o["style"].length >0) {
				this.loadderPlugins += o["style"].length
				let cssPath = (o["external_path"]) ? `${module[0]}/` : `../node_modules/${o["name"].toLowerCase()}/`
				let css = this.updatePath(o.style, cssPath, 'before');
				this.loadExternal(css,'css' );
			}
			if (o["hipperText"]){
				this.loadderPlugins++;
				let path = (o["external_path"]) ? `${module[0]}/` : `../node_modules/${o["name"].toLowerCase()}/`
				let file = this.updatePath([o.hipperText], path, 'before');
				this.loadExternal(file,'html' );
			}

		}	
		this.loadExternal(uri["jsInit"], 'js', "jsInit")
		this.loadExternal(uri["jsEnd"], 'js', "jsEnd")
	};
	this.__updateFiles = () => {
		/*
		 * Función encarga de organizar el objeto que se debe devolver al servidor para que este
		 * pueda enviar al navegador de forma correcta lo que está pidiendo.
		*/
		let f = this.path+'public/index.html',
			data = fs.readFileSync(f, 'utf-8'),
			js = `${this.toReplace.js.jsInit}\n${this.toReplace.js.middle}\n${this.toReplace.js.jsEnd}`;
			this.toReplace["html"] = data + this.toReplace["html"];
			this.toReplace["js"] = js;			
			this.end = true;
			return this.toReplace;
	};
	this.__getJumpBack = (str) => {
		/*
		 * Método encargado de crear el absoluto a través del relativo.
		 * recive la localización inicial junto con el camino relativo
		 * calcula cuantos saltos a atrás tiene que dar y genera el
		 * string con la ruta correcta
		 */
		if (str.search(/\/?\.{2}/g) == -1) return str;
		let steps = str.match(/\/?\.{2}/g).length,
			path = str.split("/"),
			toJoin = path.indexOf("..");
		path.splice(toJoin - steps, steps *2);
		return path.join("/");
	};
	this.__copyInBuffer = (src) => {
		/*
		 * Hace una réplica en .buffer de la carpeta de dist para
		 * que al cargar los elemementos en los que se permite la
		 * personalización del usuario, nunca afecte al archivo origen
		 * Esta carpeta debería ser eliminada cuando la app se cierre
		 */ 
		fs.readdir(src, (err, dir) => { 
			if (err) console.error(err)
			for (let i = 0; i < dir.length; i++) {
				if (fs.lstatSync(src + dir[i]).isFile()) {
					let ext = dir[i].split(".").splice(-1)[0];
					if (this.encodingExtensionsFile.indexOf(ext) !== -1 && ext !== 'map')
						this.filesToRead.push(src + dir[i]);
				} else if (fs.lstatSync(src + dir[i]).isDirectory())
					this.__copyInBuffer((src + dir[i] + '/'));
			}
			this.ready[0] = true;
			let cond = (this.ready[2] === this.config[this.ProgramName].style.length + this.config[this.ProgramName].script.length+this.loadderPlugins);
			if (this.ready[0] && this.ready[1] && cond) {
				this.__updateFiles();
			}
		});
	};
	this.loadModules = async function(obj, scope) {
		while (true) {
			if (this.ready[0] && this.ready[1]) {
				break;
			} else await sleep(1);
		}
		for (let o in this.bcknd) {
			obj[o] = this.bcknd[o];
			obj[o]();
		}
	}
	this.path = this.__getJumpBack(path);
	this.configPath = this.path + "/../../commonModules/config.json";
	//constructor
	this.secuence = async () => {
		fs.readFile(this.configPath, 'utf-8', (err, data) => {
			if (err) return (err.errno !== -2) ? console.error(err.errno) : console.error(err);
			let filesToReplace = ['index.html', 'index.js'],
				scope = {css: "", js: ""},
				config = {};
			config = JSON.parse(data);
			this.config = config;
			this.__copyInBuffer(this.path + "/public/");
			if (config[this.ProgramName]) {
				//Cargamos los css personales de haberlos			
				if (config[this.ProgramName]["style"])
					this.loadExternal(config[this.ProgramName]["style"]);
				if (config[this.ProgramName]["script"])
					this.loadExternal(config[this.ProgramName]["script"], 'js');
				//Después se mira si tiene algún plugin y si lo tiene que cargar
				if (config[this.ProgramName]["pluggins"].length >= 1) this.__loadPlugins(config[this.ProgramName]["pluggins"]);
				else this.loadderPlugins = 0;

			}
			this.ready[1] = true;
			//Si ya han terminado ambos metodos asyncronicos, se llama  this.update
			let cond = (this.ready[2] === this.config[this.ProgramName].style.length + this.config[this.ProgramName].script.length+this.loadderPlugins);
			if (this.ready[0] && this.ready[1] && cond) {
				this.__updateFiles();
			}
		});
		while (!this.end) {
			await sleep(1);
		}
		return this.toReplace;
	};
	this.updatePath = (arr, str, place='before') => {
		/*
		 *Función encargada de actualizar la ruta a los archivos dentro de un array.
		 *arr: [String] -> Contiene la lista de archivos a actualizar
		 *str: String -> Que es lo que hay que añadir a todos los strng
		 *before: String -> Donde se añade, si antes o después del string
		 *devuelve el array actualizado
		*/
		let newArr = [],
			before = '',
			after = '';
		if (place.search('b') != -1) before = str;
		else after = str
		for (let a of arr)
			newArr.push(`${before}${a}${after}`);
		return newArr;
	};

}
module.exports = exports = loadApp;
