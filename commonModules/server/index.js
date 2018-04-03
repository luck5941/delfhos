function SERVER() {
    const http = require('http');
    const fs = require('fs');
    this.mime_types = { 'js': 'text/javascript', 'json': 'application/json', 'html': 'text/html', 'css': 'text/css', 'jpg': 'image/jpg', 'png': 'image/png', 'gif': 'image/gif' };
    this.logs = 'logs';
    this.port = 8080;
    this.forbidden = 'public/template/forbidden.html';
    this.badway = 'public/template/badway.html';
    this.forbidden_web = false;    
    this._server = (req, res) => {
        var d = new Date(),
            str = '';
        req_save = { "url": "", "date": "", "ip": "", "code": "" },
            path = req.url.split('/'),
            files = '';        
        path = (path[path.length - 1] == '') ? path.join('/') + 'index.html' : path.join('/');
        req_save['url'] = req.url;
        req_save["date"] = `${d.getFullYear()}/${d.getMonth()}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
        req_save["ip"] = req.connection.remoteAddress.split(":")[req.connection.remoteAddress.split(":").length - 1];        
        file = __dirname + '/public' + path;
        if (fs.existsSync(file))
            fs.readFile(file, (e, d) => {
                if (e) {
                    req_save["code"] = '500';
                    res.writeHead("500", 'text/plain');
                    res.end("Error interno.");                    
                    fs.appendFile("logs/errors", e + '\n', function(err) {
                        if (err) throw err;
                    });
                } else {

                    let ext = file.split('.').pop();
                    console.log("ext: " + ext + "\nfile:" + file);
                    req_save["code"] = '200';
                    try {
                        req_save["content-type"] = this.mime_types[ext];
                        res.writeHead("200", this.mime_types[ext]);
                        res.end(d);
                    }
                    catch (e) {
                    	console.log("en el catch");
                    	console.log(this.mime_types);
                    }
                }
                for (o in req_save)
                    str += req_save[o] + ';'
                fs.appendFile("logs/serverLogs", str + '\n', function(e) {
                    if (e) throw e;
                });
            });
        else {
            req_save["code"] = '400';
            res.writeHead("400", 'text/html');
            res.end(this.forbidden_web);
            console.log(this.forbidden_web);
            fs.appendFile("logs/serverLogs", str + '\n', function(e) {
                if (e) throw e;
            });
        }
    }


    this.init = () => {
        console.log("inti")
        /*try{
        	fs.mkdir('logs');
        	fs.mkdir('public');
        	fs.mkdir('template');
        }
        catch (e) {
        	console.log(e);
        }*/        
        fs.exists('logs', (e) => { if (!e) fs.mkdir('logs', () => {}); });
        fs.exists('public', (e) => { if (!e) fs.mkdir('public', () => {}); });
        fs.exists('public/template', (e) => {
            if (!e) {
                fs.mkdir('public/template', (e) => {});
                fs.createReadStream('node_modules/server/forbidden.html').pipe(fs.createWriteStream('public/template/forbidden.html'));
                fs.createReadStream('node_modules/server/serverStyle.css').pipe(fs.createWriteStream('public/template/serverStyle.css'));
                //fs.createReadStream('node_modules/server/badway.html').pipe(fs.createWriteStream('template/badway.html'));
            }
            fs.readFile(this.forbidden, (e, d) => {return (e)? console.log(e): this.forbidden_web = d;});

        });
    };

    this.up = (port = this.port, listen = true) =>{
        console.log("entra");
        return "holala"
        //return (listen) ? http.createServer(this._server).listen(port): http.createServer(this._server);
    }

    
}


module.exports = exports = SERVER
