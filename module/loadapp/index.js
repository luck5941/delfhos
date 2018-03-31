var loadApp = function (path, configPath, name, toLoad = []) {
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
	function sleep(ms) {
  		return new Promise(resolve => setTimeout(resolve, ms));
	}
	this.path = path;
	this.homeDir ='';
	this.configPath = this.path + "/" +configPath;
	this.ready = [false, false];
	this.ProgramName = name;
	this.css = '';
	this.jsInit = '';
	this.jsEnd = '';
	this.filesToRead = [];
	this.encodingExtensionsFile = ['js', 'css', 'html'];
	this.toLoad = toLoad;
	this.bcknd = {};
	this.__loadCss = (css, where = 'css/') => {
		for (let s of css)
				this.css += `<link rel="stylesheet" href="${where}${s}.css">`;
	};
	this.__loadPlugins = (obj) => {
		/*
		 * Esta función se encarga de cargar los diferentes plugins
		 * que se hayan indicado en el fichero de
		 * de configuración, o que se hayan pasado por parametro.
		 * obj: Object -> Contiene toda la información del objeto que se
		 * necesita cargar.
		*/
		let module, path, where, name_fr, name_bk, findIt = true;
		for (let o of obj) {
			if(!o["load_default"] && this.toLoad.indexOf(o["name"]) === -1) continue;
			path = (o["external_path"]) ? o["external_path"] : "";
			module = o["name"].split(".");
			if (module.length === 1) module.push("");
			else module[1] = "."+ module[1];
			module[0] = path + module[0].toLowerCase();
			where  = (o["at_init"]) ? "jsInit" : "jsEnd";
			if (o["difference_between_front_and_back"]){			
				name_fr = (o["difference_between_front_and_back"] === true) ? "Render" : "{ " + o["difference_between_front_and_back"][1] + "}";
				name_bk = (o["difference_between_front_and_back"] === true) ? "Main" : o["difference_between_front_and_back"][0];
				// console.log(`${o["name"].split(".").slice(-1)}_${name_bk}`)
				this[where] += `const ${o["name"].split(".").slice(-1)}_${name_fr} = require('${module[0]}')${module[1]}.${name_fr};`;
				try{this.bcknd[`${o["name"].split(".").slice(-1)}_${name_bk}`] = (module[1]) ? require(module[0])[module[1].slice(1)][name_bk] : require(module[0])[name_bk];}
				catch(e){findIt = false;}
				if (!findIt){					
					try{this.bcknd[`${o["name"].split(".").slice(-1)}_${name_bk}`] = (module[1]) ? require( "../"+ module[0])[module[1].slice(1)][name_bk] : require("../"+module[0])[name_bk];}
					catch(e){console.error(`el módulo o libreria ${o["name"]} no se ha encontrado. Por favor, contacte con el adminsitrador del sistema`);}
				}
			}
			else {
				if (o["place"].indexOf("f") !== -1) this[where] += `const ${module[1].slice(1)} = require('${module[0]}')${module[1]};`;
				else if (o["place"].indexOf("b" !== -1)) this.bcknd[module[1]] = require(module[0])[module[1]];
			}
			if (o["exec"] && (o["place"].indexOf("f") !== -1 || o["difference_between_front_and_back"]))
				this[where] +=`${o["name"].split(".").slice(-1)}_${name_fr}()`
			if (o["style"]){
				let cssPath = (o["external_path"]) ? `${module[0]}/` : `../node_modules/${o["name"].toLowerCase()}/`
				this.__loadCss(o["style"], cssPath);
			}
		}		
	};
	this.__updateFiles = () => {
		for (let f of this.filesToRead){
			fs.readFile(f, 'utf-8', (err, data) => {
				if (err) return console.error(err)
				let change = data.match(/[#][{](\w*)[}]/g),
					dst = f.replace('/dist/public', '/.buffer');
				if (change){
					for (let i of change){
						let par = i.replace('#{', '').replace('}', '');
						data = data.replace(i, this[par]);
					}
				}
				fs.writeFile(dst, data, (err) => {
					if (err) return console.err(err);
				});
			});
		}
	};
	this.__getJumpBack = (str) => {
		/*
		 * Método encargado de crear el absoluto a través del relativo.
		 * recive la localización inicial junto con el camino relativo
		 * calcula cuantos saltos a atrás tiene que dar y genera el
		 * string con la ruta correcta
		*/
		let steps = str.match(/\/\.{2}/g).length,
			path = str.split("/"),
			toJoin = path.indexOf("..");
		path.splice(toJoin-1, steps+1);
		return path.join("/");
	}
	this.__copyInBuffer = (src, dst) => {
		/*
		 * Hace una réplica en .buffer de la carpeta de dist para
		 * que al cargar los elemementos en los que se permite la
		 * personalización del usuario, nunca afecte al archivo origen
		 * Esta carpeta debería ser eliminada cuando la app se cierre
		*/
		if (dst.indexOf("..") !== -1) dst = this.__getJumpBack(dst);
		try{fs.mkdirSync(dst, '0755');}
		catch (e) {
			if (e.errno !== -17)
				console.error(e)
		}
		fs.readdir(src, (err, dir) => {
			for (let i = 0; i<dir.length; i++){
				if (fs.lstatSync(src + dir[i]).isFile()){
					let ext = dir[i].split(".").splice(-1)[0];
					if (this.encodingExtensionsFile.indexOf(ext) !== -1 && ext !== 'map') 
						this.filesToRead.push(src + dir[i]);
					else
						fs.createReadStream(src + dir[i]).pipe(fs.createWriteStream(dst +"/"+ dir[i]));
				}
				else if (fs.lstatSync(src + dir[i]).isDirectory())
					fs.mkdir(dst +"/"+dir[i], '0755', (e)=>{
						if (e) if (e.errno !== -17) console.error(e); // si hay un error y e es distinto de -17 (la carpeta ya existe) se imprime el error
							this.__copyInBuffer((src + dir[i] + '/'), dst +"/"+ dir[i]);
					});
			}
			this.ready[0] = true;
			if (this.ready[0] && this.ready[1]){
				this.__updateFiles();
				//this.ready[0] = false;
			}
		});
	};
	this.loadModules = async function(obj, scope){
		while (true) {			
			if (this.ready[0] && this.ready[1]){
				break;
			}			
			else await sleep(1);
		}		
		for (let o in this.bcknd){
			obj[o] = this.bcknd[o];
			obj[o]();
		}
	}
	//destructor
	this.clearBuffer = (path = this.path+ "/../.buffer/") => {
		fs.readdir(path, (err, file) => {
			if (err) return console.error(err);
			if (file.length == 0)
				fs.rmdir(path, (e) => {if (e) console.error(e);});
			for (f of file){
				if (fs.lstatSync(`${path}${f}`).isFile())
					fs.unlink(`${path}${f}`, (e) => {
						if (e) console.error(e);
					});
				else if(fs.lstatSync(`${path}${f}`).isDirectory())
					this.clearBuffer(`${path}${f}/`);					
			}
			fs.rmdir(path, (e) => {if (e) this.clearBuffer(path)});

		});
	};
	this.pathToLoad = this.__getJumpBack(`${this.path}/../.buffer`);
	//constructor
	this.__secuence = (() => {
		//llammamos a __copyInBuffer
						/*this.__copyInBuffer(this.path+"/public/", this.path +'/../../../.buffer');*/
		//leemos el fichero de configuración
		fs.readFile(this.configPath, 'utf-8', (err, data)=>{
			if (err) return (err.errno !== -2) ? console.error(err.errno) : null;
			let filesToReplace = ['index.html', 'js/main.js'],
				scope = {}
			scope.css = ''; scope.js = '';
			config = JSON.parse(data);
			//Primero cargamos el nombre del usuario
			this.homeDir=`/home/${config["name"]}/`;
			if (config[this.ProgramName]){
				//Cargamos los css personales de haberlos			
				if (config[this.ProgramName]["style"]) 
					this.__loadCss(config[this.ProgramName]["style"]);
				//Después se mira si tiene algún plugin y si lo tiene que cargar
				if (config[this.ProgramName]["pluggins"].length >=1) this.__loadPlugins(config[this.ProgramName]["pluggins"]);
				this.ready[1] = true;
			}
			//Si ya han terminado ambos metodos asyncronicos, se llama  this.update
			if (this.ready[0] && this.ready[1]){
				this.__updateFiles();
				//this.ready[1] = false;
			}
		});
	})();

}
module.exports = exports = loadApp;

