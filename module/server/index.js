function SERVER(modules) {
	const http = require('http');
	const fs = require('fs');
	const url = require('url');
	const {contentType} = require('mime-types');
	let sleep = (ms) => {return new Promise(resolve => setTimeout(resolve, ms));},
		req_save = { "url": "", "date": "", "ip": "", "code": "" },
		str = '';
	this.logs = 'logs';
	this.port = 8080;
	this.forbidden = __dirname + '/files/forbidden.html';
	this.serverStyle = __dirname + '/files/serverStyle.css';
	this.badway = __dirname + '/files/badway.html';
	this.modules = modules;
	this.base = '';
	this.lib = {css: "", js: ""}
	this._server = (req, res) => {
		var d = new Date(),
			uri = req.url,
			path = '',
			q = url.parse(uri);
		path = (q.pathname === '/') ? '/desktop' : q.pathname;
		req_save['url'] = req.url;
		req_save["date"] = `${d.getFullYear()}/${d.getMonth()}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
		req_save["ip"] = req.headers['x-forwarded-for'] || req.connection.remoteAddress.split(":").slice(-1)[0];
		console.log(req_save['ip']);
		str = `${req_save["ip"]};${req_save["date"]};${req_save['url']}`
		//Obtención de la clave que se le impone por cookie
		let id = req_save["ip"]+ "_"+this.getCookieValue(req.headers.cookie, '_id');
		let headersObj = {};
		if (this.modules[path]){
			if (path !== '/login'){
				if (!id || !session[id] || !session[id].register){
					return this.redirect(res,'login');
				}
			}
			if (path == '/login' && !global.session[id]){
				let now = new Date();
				now = now.getTime();
				id = req_save["ip"]+ "_"+now;
				headersObj = {'Set-Cookie':"_id="+now};
				global.session[id] = {};
			};

			let l  = new global.modules["LoadApp"](`${__dirname}/..${path}/`, path.slice(1));
			let instanceName = `${id}_${path.slice(1)}`;
			if (!instances[instanceName]) instances[instanceName] = [];
			let obj = global.modules[path.slice(1)];
			global["instances"][instanceName].push(new obj(id)); 
			let m = l.secuence();
			m.then((d)=>{
				let moduleInstance = global["instances"][instanceName].slice(-1)[0];
				let customize = (Object.keys(moduleInstance).indexOf('customize') !=-1);
				if (customize){
					let p = moduleInstance.customize(d, id);
					return p.then((d) => {
						session[id].css = this.lib.css + d.css;
						session[id].js = "let sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));\n"+this.lib.js + d.js + "\nvar comunication = new Client(external);";
						let html = this.base
										.replace(`<${path.slice(1)}></${path.slice(1)}>`, `<${path.slice(1)}>${d.html}</${path.slice(1)}>`)
										.replace("#{css}", '<link rel="stylesheet" type="text/css" href="/foo.css">')
										.replace("#{js}", '<script type="text/javascript" src="/foo.js"></script>');
						headersObj['Content-Type'] = contentType("html");
						return this._sendFile(res, html, ["200", headersObj])
					});
				}
				else{ 
					session[id].css = this.lib.css + d.css;
					session[id].js = "let sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));\n"+this.lib.js + d.js + "\nvar comunication = new Client(external);";
					let html = this.base
									.replace(`<${path.slice(1)}></${path.slice(1)}>`, `<${path.slice(1)}>${d.html}</${path.slice(1)}>`)
									.replace("#{css}", '<link rel="stylesheet" type="text/css" href="/foo.css">')
									.replace("#{js}", '<script type="text/javascript" src="/foo.js"></script>');
					return this._sendFile(res, html, ["200", headersObj])
				}
			});
		}
		else if (path == '/download'){			
			let name = this.getCookieValue(q.query, 'name');
			return this.download(name, id,res)
		}
		else if (path.search('foo') !== -1){
			let ext = /foo\.(\w{2,3})/.exec(path)[1]
			return (session[id][ext]) ? this._sendFile(res, session[id][ext], [200, contentType(ext)]) : this.forbiddenFunct(res, id);
		}
		else if(Object.keys(this.modules).indexOf(path.split(".")[0]) !==-1 || path.search('/modal') !== -1){
			let name = path.slice(1),
				ext = path.split(".")[1];
			return (session[id][name]) ? this._sendFile(res, session[id][name], [200, contentType(ext)]) : this.forbiddenFunct(res, id);
		}
		else if (path.search(/^\/profile\/\w*/) !== -1){
			fs.realpath(`files/${path}`, (e,d) => {
				if (e) return this.forbiddenFunct(res, id);
				let ext = path.split('.').slice(-1)[0];
				fs.readFile(d, (e, d) => e ? this.forbiddenFunct(res, id) : this._sendFile(res, d, ["200", contentType(ext)]));
			});
		}
		else if (path.search(/^(\/?\w*)*\.\w*$/) !== -1){
			let toAdd = /^\/common/.test(path) ? "" : "/users/"+session[id].user
			path = process.cwd() +"/files"+toAdd+path;
			let ext = path.split('.').slice(-1)[0];
			fs.readFile(path, (e, d) => e ? this.forbiddenFunct(res, id) : this._sendFile(res, d, ["200", contentType(ext)]));
		}
		else this.forbiddenFunct(res, id);

	}
	this._sendFile = (res, content, headers) => {
		let headersObj = headers[1];
		try{
			res.writeHead(headers[0],headersObj);
			res.end(content);
		}
		catch (e){
			content.then((d)=>{res.writeHead(headers[0], headersObj);res.end(d);});
		}
	};
	this.__createWin = async (file = `${__dirname}/../../public/index.html`) => {
		/*
		 *función encargada de enviar el string correspondiente para que el navegador pueda renderizar correctamente el modulo.
		 *return:strng
		*/		
		let html = '',
			extPat = /\#\{(\w*)\}/,
			ext = '',
			rsc = {};
		fs.readFile(file, 'utf-8', (e, bufferFile)=>{
			let pat = `[\\"\\']((\\/?\\.{2})*(\\/?[\\w-\\.]*)*)[\\"\\'"]`,
				paterns = [`\\t?<link.*href=${pat}>\\n?`, `\\t?<script.*src=${pat}></script>\\n?`],
				path = '';
			for (let i in paterns) {
				let p = new RegExp(paterns[i]);
				while((path = p.exec(bufferFile)) != null){
					let content = fs.readFileSync(`${__dirname}/../../${path[1]}`, 'utf-8'),
						ext = path[1].split(".").slice(-1);
					if (!rsc[ext]) rsc[ext] = '';		
					rsc[ext] += content
							.replace(/[\n\t\r]*module\.exports\s?=\s?\w*;?[\n\t\r]*$/, '')
							.replace(/[\n\t\r]*\/\*#\ssourceMappingURL=(\w*\.?){3}[\n\t\r]*/, '');
					bufferFile = bufferFile.replace(path[0], '');
				}
			}
			
			html = bufferFile
		});
		while (!html){await sleep(1);}
		for (let e in rsc){
			this.lib[e] += rsc[e];
		}		
		this.base = html;
		return html;
	};
	this.redirect = (res,place) => {
		/*
		 * función encargada de redirigir al usuario a una página determinada
		 * place: String -> url a la que se le redirige al usuario
		*/
		req_save["code"] = '304';
		str +=";"+req_save["code"];
		fs.appendFile("logs/serverLogs", str + '\n', function(e) {
			if (e) throw e;
		});
		res.writeHead(307,{'Location': place, 'Content-Type': 'multipart/form-data'});
		res.end();
	};
	this.forbiddenFunct = (res, id)=> {
		req_save["code"] = '403';
		fs.readFile(this.forbidden, (e, d) => this._sendFile(res, d, [req_save["code"], contentType("html")]));
		str +=";"+req_save["code"];
		fs.appendFile("logs/serverLogs", str + '\n', function(e) {
			if (e) throw e;
		});
	};
	this.getCookieValue = (cookie, key = false) => {
		/*
		 *metodo encargado de devolver el valor de una cookie. Si key esta vacio. devuelve el objeto con todos los datos
		 * cookie:String -> cookies que se quieran analizar
		 * key: [any] -> valor o valores que se quieran obtener
		*/
		if (!cookie) return false;
		let obj = {}
			arr = [],
			reg = /(\w*)=(.*)/,
			mach = [];
		arr = cookie.split(";");		
		for (let a of arr){
			match = reg.exec(a);
			if (key){
				if(key === match[1])
					obj = match[2];
				continue;
			}
			else 
				obj[match[1]] = match[2];
		}
		return (Object.keys(obj).length !==0) ? obj : false; 
	};
	this.init = () => {		
		fs.exists('logs', (e) => { if (!e) fs.mkdir('logs', () => {}); });
		fs.exists('public', (e) => { if (!e) fs.mkdir('public', () => {}); });
		this.__createWin();
	};
	this.up = (port = this.port, listen = true) => (listen) ? http.createServer(this._server).listen(port): http.createServer(this._server);

	this.download = (name, key, res) => {
		/*
		 *metodo encargado de gestionar las descargas cuando un usuario demande un archivo
		 *name:String -> nombre que se le debe dar al archivo cuando este sea descargado
		 *res: Obj -> Objeto de respuesta que permita gestionar la descarga en cuestión.
		*/
		let mimeTypes = contentType(name);		
		res.writeHead(200, {"Content-Disposition": "attachment; filename="+name, "Content-Type": mimeTypes});
		fs.readFile(`tmp/${key}`, (e, d) => {
			if (e)  return console.error(e);
			fs.unlink(`tmp/${key}`, (e) => (e) ? console.error(e) : null);
			res.end(d);
		});
	} 
}


module.exports = exports = SERVER
