function SERVER(modules) {
	const http = require('http');
	const fs = require('fs');
	const url = require('url');
	let sleep = (ms) => {return new Promise(resolve => setTimeout(resolve, ms));},
		req_save = { "url": "", "date": "", "ip": "", "code": "" },
		str = '';
	this.mime_types = { 'js': 'text/javascript', 'json': 'application/json', 'html': 'text/html', 'css': 'text/css', 'jpg': 'image/jpg', 'png': 'image/png', 'gif': 'image/gif' };
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
			path = '';
		uri = url.parse(uri);
		path = (uri.path === '/') ? '/desktop' : uri.path;
		req_save['url'] = req.url;
		req_save["date"] = `${d.getFullYear()}/${d.getMonth()}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
		req_save["ip"] = req.connection.remoteAddress.split(":").slice(-1)[0];
		str = `${req_save["ip"]};${req_save["date"]};${req_save['url']}`
		//Obtención de la clave que se le impone por cookie
		let id = this.getCookieValue(req.headers.cookie, '_id');
		if (this.modules[path]){
			if (path !== '/login')
				if (!id || !session[id])
					return this.redirect(res,'login' );
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
						d.css = this.lib.css + d.css;
						d.js = this.lib.js + d.js;
						let html = this.base.replace(`<${path.slice(1)}></${path.slice(1)}>`, `<${path.slice(1)}>${d.html}</${path.slice(1)}>`).replace("#{css}", d.css).replace("#{js}", d.js);	
						return this._sendFile(res, html, ["200", this.mime_types["html"]])
					});
				}
				else{ 
					d.css = this.lib.css + d.css;
					d.js = this.lib.js + d.js;
					let html = this.base.replace(`<${path.slice(1)}></${path.slice(1)}>`, `<${path.slice(1)}>${d.html}</${path.slice(1)}>`).replace("#{css}", d.css).replace("#{js}", d.js);
					return this._sendFile(res, html, ["200", this.mime_types["html"]])
				}
			});
		}
		else if (path.search(/^(\/?\w*)*\.\w*$/) !== -1){
			let id = this.getCookieValue(req.headers.cookie, '_id');
			let toAdd = /^\/common/.test(path) ? "" : "/users/"+session[id].user
			path = __dirname+"/../../files"+toAdd+path;
			let ext = path.split('.').slice(-1)[0];
			fs.readFile(path, (e, d) => e ? this.forbiddenFunct(res) : this._sendFile(res, d, ["200", this.mime_types[ext]]));
		}
		else this.forbiddenFunct(res);
	}

	this._sendFile = (res, content, headers) => {
		try{
			res.writeHead(headers[0], headers[1]);
			res.end(content);
		}
		catch (e){
			content.then((d)=>{res.writeHead(headers[0], headers[1]);res.end(d);});
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
				paterns = [`<link.*href=${pat}>`, `<script.*src=${pat}></script>`],
				path = '';
			for (let i in paterns) {
				let p = new RegExp(paterns[i]);
				while((path = p.exec(bufferFile)) != null){
					let content = fs.readFileSync(`${__dirname}/../../${path[1]}`, 'utf-8'),
						ext = path[1].split(".").slice(-1);
					if (!rsc[ext]) rsc[ext] = '';					
					rsc[ext] += content.replace(/[\n\t\r]*module\.exports\s?=\s?\w*;?[\n\t\r]*$/, '');
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
		req_save["code"] = '307';
		str +=";"+req_save["code"];
		fs.appendFile("logs/serverLogs", str + '\n', function(e) {
			if (e) throw e;
		});
		res.writeHead(307,{'Location': place, 'Content-Type': 'multipart/form-data'});
		res.end();
	};

	this.forbiddenFunct = (res)=> {
		req_save["code"] = '403';
		fs.readFile(this.forbidden, (e, d) => this._sendFile(res, d, [req_save["code"], this.mime_types["html"]]));
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
		return obj
	};

	this.init = () => {		
		fs.exists('logs', (e) => { if (!e) fs.mkdir('logs', () => {}); });
		fs.exists('public', (e) => { if (!e) fs.mkdir('public', () => {}); });
		this.__createWin();
	};

	this.up = (port = this.port, listen = true) => (listen) ? http.createServer(this._server).listen(port): http.createServer(this._server);
}


module.exports = exports = SERVER
