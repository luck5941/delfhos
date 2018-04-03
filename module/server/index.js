function SERVER(modules) {
	const http = require('http');
	const fs = require('fs');
	const url = require('url');
	const LoadApp = require("../../commonModules/loadapp")
	function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}
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
			str = '',
			req_save = { "url": "", "date": "", "ip": "", "code": "" },
			uri = req.url,
			path = '';		
		uri = url.parse(uri);		
		path = (uri.path.search(/^\//)) ? `${uri.path}index.html` : uri.path;
		req_save['url'] = req.url;
		req_save["date"] = `${d.getFullYear()}/${d.getMonth()}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
		req_save["ip"] = req.connection.remoteAddress.split(":")[req.connection.remoteAddress.split(":").length - 1];
		str = `${req_save["ip"]};${req_save["date"]};${req_save['url']}`
		if (this.modules[path]){		
			let l  = new LoadApp(`${__dirname}/..${path}/`, "../../commonModules/config.json", path.slice(1));
			let m = l.secuence();
			m.then((d)=>{
				d.css = this.lib.css + d.css;
				d.js = this.lib.js + d.js;
				let html = this.base.replace(`<${path.slice(1)}></${path.slice(1)}>`, `<${path.slice(1)}>${d.html}</${path.slice(1)}>`).replace("#{css}", d.css).replace("#{js}", d.js);				
				return this._sendFile(res, html, ["200", this.mime_types["html"]])
			});
		}
		else {
			req_save["code"] = '403';
			fs.readFile(this.forbidden, (e, d) => this._sendFile(res, d, [req_save["code"], this.mime_types["html"]]));
			str +=";"+req_save["code"];
			fs.appendFile("logs/serverLogs", str + '\n', function(e) {
				if (e) throw e;
			});
		}
	}

	this._sendFile = (res, content, headers) => {
		try{
			res.writeHead(headers[0], headers[1]);
			res.end(content);
		}
		catch (e){			
			content.then((d)=>{res.writeHead(headers[0], headers[1]);res.end(d);})
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
					//bufferFile = (bufferFile.search(`#{${ext}}`) == -1) ? bufferFile.replace(path[0], `#{${ext}}`) : bufferFile.replace(path[0], ``)
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

	this.init = () => {		
		fs.exists('logs', (e) => { if (!e) fs.mkdir('logs', () => {}); });
		fs.exists('public', (e) => { if (!e) fs.mkdir('public', () => {}); });
		this.__createWin();
	};

	this.up = (port = this.port, listen = true) => (listen) ? http.createServer(this._server).listen(port): http.createServer(this._server);
}


module.exports = exports = SERVER
