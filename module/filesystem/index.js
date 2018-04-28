'use strict';
/*Importación de módulos */
function FILESYSTEM(id) {
	const fs = require('fs');	
	var sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms)) 
	this.id = id;
	/*Variables globales*/
	this.currentPath = '';
	this.homeName = "Carpeta personal";
	this.homeDir;
	this.trashPath = '';
	this.modal;
	/*metodos locales*/
	var copyRecursive = (files, src, dst) => {
		/*
		 * Función encargada de copiar de forma recursiva una lista de archivos
		 * files: [String] -> Contiene una lista de los nombres que se deben copiar
		 * src: String  -> La ruta a esos archivos
		 * dst: String -> La ruta de la carpeta en la que se deben copiar
		 */
		let name = '';
		for (let f of files) {
			if (fs.lstatSync(f).isFile()) {
				name = renameOneFile(`${dst}`, f.split("/").slice(-1)[0]);
				fs.createReadStream(`${f}`).pipe(fs.createWriteStream(`${name}`));
			} else if (fs.lstatSync(f).isDirectory()) {
				fs.mkdir(`${dst}${f}`, '0744', (e) => {
					if (e) return console.error(e);
					copyRecursive(fs.readdirSync(f), `${src}${f}/`, `${dst}${f}/`);
				});
			}
		}
	};
	var getZip = async (files, name) => {
		var output = fs.createWriteStream('tmp/'+name);
		let end = false;
		output.on('close', () => {
			end = true;
		});
		var archive = archiver('zip', {
			zlib: { level: 9 } // Sets the compression level.
		});
		archive.pipe(output);
		for (let i of files){
			i = this.homeDir+i;
			if (fs.lstatSync(i).isFile())
				archive.file(i, {name: i.split("/").slice(-1)[0]})
			else if (fs.lstatSync(i).isDirectory())
				archive.directory(i, i.split("/").slice(-1)[0])
		}
		archive.finalize();
		while (!end){
			await sleep(1);
		}
		return true;

	};
	var renameOneFile = (path, newName) => {
		/*
		 * Función encargada de devolver el nombre del archivo en el nuevo directorio,
		 * modificandolo en caso de encontrar un nombre igual en el directorio al que se transpasa,
		 * evitando la perdida de ficheros
		 * path: String Donde se va a crear el nuevo archivo
		 * newName: String | Array Nombre del archivo a copair. Si es un array, quiere decir que
		 * ya se ha obtenido su extensión y su nombre por separado, por lo que no será necesario repetir
		 * esta operación
		 *
		 */
		let ext, name, cond = true,
			reg = /([\wÁÉÍÓÚáéíóúÄËÏÖÜäëïöüÀÈÌÒÙàèìòù]*[\s\.]?)*_(\d*)/;
		let i = 0;
		while (cond && i < 10) {
			i++;
			try {
				fs.lstatSync(`${path}${newName}`);
			} catch (e) {
				cond = (e.errno === -2) ? false : true;
				continue;
			}
			newName = (typeof(newName) === 'string') ? separateName(newName) : newName;
			name = newName[0];
			ext = newName[1];
			if (!reg.test(name)) {
				newName = `${name}_1${ext}`;
			} else {
				let match = name.match(reg);
				newName = `${match[1]}_${parseInt(match[2])+1}${ext}`;
			}
		}
		return `${path}${newName}`;
	};
	var generateStringNewName = (files, newName, oldExt) => {
		/*
		 * Función encargada de evaluar la extensión de los archivos
		 * files [String] -> Conjunto de archivos a cambiar
		 * newName: string ->El nombre que se desea
		 * oldExt: string -> La extensión que se quiere cambiar
		 * devuelve [String] -> con los nuevos nombres
		 */

		let ext = {},
			name = [],
			str = '',
			newFiles = [];
		for (let i = 0; i < files.length; i++) {
			let f = files[i];
			name = f.split(".");
			let extKey = (name.length > 1) ? name.slice(-1)[0] : '';

			if (!ext[extKey]) ext[extKey] = [];
			ext[extKey].push(true);
			str = `${newName[0]}_${ext[extKey].length}${(extKey === oldExt) ? newName[1] : "." + extKey}`;
			newFiles.push(str)
		}
		return newFiles;
	};
	var separateName = (name) => {
		/*
		 * Función encargada de determinar si el nuevo nombre introducido
		 * tiene extensión o no
		 * name: String
		 * return [String]  con el valor del nombre y la ext por separado
		 */

		let reg = /(.*)(\.\w*)$/,
			match = [],
			newName = '',
			ext = '';
		match = name.match(reg);
		if (!match) {
			newName = name;
			ext = '';
		} else {
			newName = match[1];
			ext = match[2]
		}
		return [newName, ext];
	};
	var removeRecursive = (files) => {
		/*
		 * Función encargada de borrar la lista de archivos que se ha indicado
		 * files: [String] Lista con los nombres completos de los archivos que se desean borrar
		 *
		 */
		for (let f of files) {
			if (fs.lstatSync(this.currentPath + f).isFile())
				fs.unlink(this.currentPath + f, (e) => (e) ? console.error(e) : null);
			else if (fs.lstatSync(this.currentPath + f).isDirectory()) {
				removeRecursive(fs.readdirSync(this.currentPath + f));
				fs.rmdir(this.currentPath + f, (e) => {
					if (e)
						return (e.errno === -39) ? removeRecursive([this.currentPath + f]) : console.error(e)
					else
						return null;
				});
			}
		}
		return [loadFiles()[0]];
	};
	var formatDate = (date) => {
		let d = new Date(date),
			form = d.toISOString().split("T"),
			day = form[0],
			time = form[1].split(".")[0];
		return `${day} ${time}`;
	};
	var getFileInfo = (x) => {
		/*
		 * Esta función se encarga de gestionar la información del inodo
		 * tipo de inodo, permisos, etc...
		 * La información de la que se extrae que significa cada número
		 * se ha obtenido de https://github.com/nodejs/node-v0.x-archive/issues/3045
		 * x:Number -> número que contiene la información del inodo.
		 * return [multiple] String (tipo de archivo) Int (permisos)
		 */
		let type, permission;
		type = ((a) => {
			a.toString();
			switch (a) {
				case '40':
					return 'Carpeta';
					break;
				case '100':
					return 'file';
					break;
				case '120':
					return 'symlink';
					break;
				default:
					return "";
			}
		})(x.slice(0, -3));;
		permission = x.slice(-3);
		return [type, permission]
	};

	/*metodos globales*/

	var loadFiles, changeDir, move, copy, initialLoad, rename, remove, getProperties, updateName, prepareToChangeName, changePermissions, newFolder, getFiles, preparedDownload;

	this.loadFiles = loadFiles = (dir = '', socket) => {
		this.currentPath = (dir !== '') ? (this.currentPath + dir[0] + '/') : this.currentPath;
		let currentFiles = { dir: [], fil: [] };
		var listDir = fs.readdirSync(this.currentPath);
		for (let i of listDir) {
			if (i.search(/^\./) !== -1)
				continue;
			else if (fs.lstatSync(`${this.currentPath}/${i}`).isDirectory())
				currentFiles['dir'].push(i);
			else if (fs.lstatSync(`${this.currentPath}/${i}`).isFile())
				currentFiles['fil'].push(i);
		};
		if (socket)
			modules.communication.send([currentFiles], 'mainScope', 'drawFiles', socket);
		else
			return [currentFiles];
	};

	this.changeDir = changeDir = (name, socket) => {
		let path = this.currentPath.split('/'),
			arr;
		this.currentPath = (name[0] !== this.homeName) ? path.slice(0, path.indexOf(name[0]) + 1).join("/") + '/' : this.homeDir;
		console.log(this.currentPath)
		arr = (name != this.homeName) ? path.slice(4, path.indexOf(name[0]) + 1) : [];
		modules.communication.send([loadFiles()[0], arr], name[1], name[2], socket);
	};

	this.move = move = (paths, socket) => {
		let files = paths[0][0],
			dst = (paths[0][1] !== 'trash') ? paths[0][1] : this.trashPath,
			name = '';

		dst = this.homeDir.slice(0, -1) + dst;
		for (let i = 0; i < files.length; i++) {
			name = renameOneFile(dst, files[i].split("/").slice(-1)[0]);
			fs.rename(this.homeDir.slice(0, -1) + files[i], name, (err) => { if (err) console.error(err); });
		}
		modules.communication.send([loadFiles()[0]], paths[1], paths[2], socket);
	};
	this.copy = copy = (files) => {
		/*
		 *metodo encargado de preparar para copiar la lista de archivos que se solicite al destino en cuestion
		 */
		let dst = this.homeDir + "/" + files[0][1],
			src_cp = files[0][0],
			src = [];
		for (let f of src_cp)
			src.push(this.homeDir.slice(0, -1) + f);
		copyRecursive(src, this.currentPath, dst);
	};
	this.initialLoad = initialLoad = (option, socket) => {
		/*
		 * función encargada de generar el estado inical desde el que se llama, inicializando todas
		 * las variables que necesiten obtener datos más complejos y no sean generales para todas las
		 * instancias como puede ser la carpeta personal del usuario
		 */
		let userName = session[this.id].user;
		this.homeDir = `files/users/${userName}/`;
		this.trashPath = `/.trash/`;
		switch (option) {
			case 'image':
				this.currentPath = this.homeDir + 'Imágenes';
				break;
			default:
				this.currentPath = this.homeDir;
		}
		let toSend = [loadFiles()[0], this.currentPath.replace(this.homeDir, '').split("/")];
		modules.communication.send(toSend, option[1], option[2], socket);
	};
	this.rename = rename = (fls) => {
		/*
		 *Función encargada de cambiar el nombre de los archivos
		 *fls: [any]
		 *fls[0]: [String] -> Contiene la lista de archivos que se quiere renombrar
		 *fls[1]: String -> El nuevo nombre del archivo.
		 *fls[2]: Bool -> Si la ext se ha modificado
		 */
		let files = fls[0][0],
			name = fls[0][1],
			extMod = fls[0][2],
			newName,
			newNames,
			names = [];
		if (files.length === 1) {
			name = renameOneFile(this.currentPath, name);
			fs.rename(`${this.currentPath}/${files[0]}`, name, (err) => { if (err) console.error(err) });
			return [loadFiles()[0]];
		}
		newName = separateName(name);
		newNames = generateStringNewName(files, newName, extMod);
		for (let i = 0; i < files.length; i++) {
			name = renameOneFile(this.currentPath, newNames[i]);
			fs.rename(`${this.currentPath}/${files[i]}`, name, (err) => { if (err) console.error(err) })
		}
		return [loadFiles()[0]];
	};
	this.getProperties = getProperties = (files, socket) => {
		//modal = new l.bcknd.Modal_Main(__dirname + '/external/properties/index.html');
		global.modules.modal.loadModal(`${__dirname}/external/properties/index.html`);
		let data = {};
		fs.lstat(this.homeDir + files[0][0], (e, s) => {
			if (e) return console.error(e)
			//Pantalla 1
			//let ownGroup = readcsv([s.uid, s.gid, '\\d{4}', '\\d{4}']);
			data.name = files[0][0].split("/").slice(-1)[0];
			data.path = "~/"+this.currentPath.split("/").slice(3).join("/")
			data.size = s.size.toString();
			//Pantalla 2
			data.lastView = formatDate(s.atime);
			data.lastConMod = formatDate(s.mtime);
			data.birthdate = formatDate(s.birthtime);
			//pantalla 3
			data.type = getFileInfo(s.mode.toString(8))[0];
			data.permission = getFileInfo(s.mode.toString(8))[1].split("");
			data.pathFile = this.currentPath + files[0];
			//data.own = ownGroup[0];
			//data.group = ownGroup[1];
			//data.owns = ownGroup[2];
			//data.groups = ownGroup[3];
			global.modules.modal.createModal(data, socket)
		});
	};
	this.newFolder = newFolder = (name, socket) => {
		fs.mkdir(`${this.currentPath}newFolder`, '0744', (e) => {
			if (e)
				if (e.errno === -17) { //la carpeta ya existe
					let listFolder = fs.readdirSync(this.currentPath);
					let ind = 1;
					let str = "newFolder";
					while (listFolder.indexOf(`${str}${ind}`) !== -1)
						ind++;
					fs.mkdir(`${this.currentPath}${str}${ind}`, '0774', (e) => (e) ? console.error(e) : null);
				}
			modules.communication.send([loadFiles()[0]], name[1], name[2], socket);
		});
	}
	this.getFiles = getFiles = (files, socket) => {
		let f = files[0][0];
		fs.writeFile(this.currentPath+f.name, f.data, 'binary', (e) => {
			if (e) return e;
		});
		modules.communication.send([loadFiles()[0]], files[1], files[2], socket);
	};

	this.preparedDownload = preparedDownload = (files, socket) => {
		/*
		 *metodo encargado de guardar en una carpeta temporal el zip con todos los archivos que se vayan a descargar.
		 *Si solo es uno, no se comprime y preserva el nombre. En caso de ser varios, procedemos a comprimir
		 *el arvhivo se guardará con el identificador de sessión del usuario en la carpeta, por si hubiese varios al mismo tiempo.
		*/

		let id = socket.handshake.address.split(":").slice(-1)[0] + "_"+modules.server.getCookieValue(socket.handshake.headers.cookie, '_id'),
			filesToDownload = files[0][0];
			let file = ''
		if (filesToDownload.length<=1 && fs.lstatSync(this.homeDir + filesToDownload[0]).isFile()){
			file = filesToDownload[0].split("/").slice(-1)[0];
			fs.createReadStream(this.homeDir + filesToDownload[0]).pipe(fs.createWriteStream(`tmp/${id}`));
			modules.communication.send(file.split("/").slice(-1), files[1], files[2], socket);
		}
		else {
			let a = getZip(filesToDownload, id);
			file =filesToDownload.length>1 ? this.currentPath.split("/").slice(-2)[0] : filesToDownload[0].split("/").slice(-1)[0];
			file +=".zip";
			a.then(()=>modules.communication.send(file.split("/").slice(-1), files[1], files[2], socket))
		}
	};

	this.remove  = remove = (files, socket) => {
		let r = removeRecursive(files[0]);
		modules.communication.send(r, files[1], files[2], socket);
	}

	updateName = (name) => comunication.send(win, 'changeName', name);


	prepareToChangeName = (file) => {
		/*
		 * Esta función se encarga de preparar el cambio de nombre en el sistema
		 * file[String]
		 * file[0] -> contiene la ruta al archivo
		 * file[1] -> contiene el nombre del archivo viejo
		 * file[2] -> contiene el nombre nuevo del archivo
		 */
		let path = this.currentPath,
			fls = [
				[file[1]], file[2], false
			],
			toReturn;
		this.currentPath = file[0];
		toReturn = rename(fls);
		this.currentPath = path;
		return toReturn;
	};

	changePermissions = (file) => {
		/*
		 * Esta función se encarga de cambiar los permisos de un archivo
		 * file[String]
		 * file[0] -> contiene la ruta al archivo
		 * file[1] -> contiene el nombre del archivo viejo
		 * file[2] -> contiene los permisos
		 */
		fs.chmod(`${file[0]}${file[1]}`, file[2], (e) => (e) ? console.error(e) : null);
	};

}

module.exports = FILESYSTEM;
