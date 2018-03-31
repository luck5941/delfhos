

function SERVER(modules) {
	const http = require('http');
	const fs = require('fs');
	const url = require('url');
	this.mime_types = { 'js': 'text/javascript', 'json': 'application/json', 'html': 'text/html', 'css': 'text/css', 'jpg': 'image/jpg', 'png': 'image/png', 'gif': 'image/gif' };
	this.logs = 'logs';
	this.port = 8080;
	this.forbidden = __dirname + '/files/forbidden.html';
	this.serverStyle = __dirname + '/files/serverStyle.css';
	this.badway = __dirname + '/files/badway.html';
	this.modules = modules;
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
		if (this.modules[path]){
			let m = new this.modules[path];			
			let content = m.createWin();
			this._sendFile(res, content, ["200", this.mime_types["html"]])
		}
		else {			
			req_save["code"] = '403';
			fs.readFile(this.forbidden, (e, d) => this._sendFile(res, d, [req_save["code"], this.mime_types["html"]]));
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

	this.init = () => {
		fs.exists('logs', (e) => { if (!e) fs.mkdir('logs', () => {}); });
		fs.exists('public', (e) => { if (!e) fs.mkdir('public', () => {}); });

	}

	this.up = (port = this.port) => {
		http.createServer(this._server).listen(port)
	}
}


module.exports = exports = SERVER
