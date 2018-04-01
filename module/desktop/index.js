'use strict';
function DESKTOP(){	
	/*Importación de módulos */
	const fs = require('fs')
	const url = require('url');
	
	/*modulos propios*/
	var EventServer = require(process.env.PWD+'/commonModules/remoteEvent');
	EventServer = EventServer.Server
	/*Variables globales*/
	var configFile = __dirname + '/../../commonModules/config.json',
		appsPath = __dirname + '/../../',
		json = {},
		user = 'lucas'; //Esto se deberá cambiar más adelante

	function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}

	/*Declaración de las funciones globales*/
	var external = {};
	/*external.openApps =  (args) => {
		var response,
			action;
		let p = exec(`electron ${appsPath}${args[0]} ${args[1]}`, (err, stdout, stderr) => {
			
			response = JSON.parse(stdout);
			action = toChange(response);		
			updatebackgroundImg();
		});	
		p.on('close', ()=>{
			comunication.send(win, action[0], action[1])
		});	
	};*/


	/*metodos locales*/
	this.createWin = async () => {
		/*
		 *función encargada de enviar el string correspondiente para que el navegador pueda renderizar correctamente el modulo.
		 *return:strng
		*/
		let html = '',
			extPat = /\#\{(\w*)\}/,
			ext = '',
			rsc = {};
		fs.readFile(`${__dirname}/public/index.html`, 'utf-8', (e, bufferFile)=>{
			let pat = `[\\"\\']((\\/?\\.{2})*(\\/?[\\w-\\.]*)*)[\\"\\'"]`,
				paterns = [`<link.*href=${pat}>`, `<script.*src=${pat}></script>`],
				path = '';
			for (let i in paterns) {
				let p = new RegExp(paterns[i]);
				while((path = p.exec(bufferFile)) != null){					
					let content = fs.readFileSync(`${__dirname}/public/${path[1]}`, 'utf-8'),
						ext = path[1].split(".").slice(-1);
					if (!rsc[ext]) rsc[ext] = '';					
					rsc[ext] += content.replace(/[\n\t\r]*module\.exports\s?=\s?\w*;?[\n\t\r]*$/, '');
					bufferFile = (bufferFile.search(`#{${ext}}`) == -1) ? bufferFile.replace(path[0], `#{${ext}}`) : bufferFile.replace(path[0], ``)
				}
			}	
			html = bufferFile

		});
		while (!html){await sleep(1);}		
		for (let e in rsc){
			let replaceStr = '';
			if (e == "css")
				replaceStr = `<style>${rsc[e]}</style>`;
			else if (e == "js")
				replaceStr = `<script type="text/javascript">${rsc[e]}</script>`;
			html = html.replace(`#{${e}}`, replaceStr);
		}
		console.log(html.search(/[\n\t\r]*module\.exports.*[\n\t\r]*/))
		return html;
	};
	
	var loadConfig = ()=>{
		let data = fs.readFileSync(configFile)
		json = JSON.parse(data);
	};
	var updatebackgroundImg = () =>{	
		let bkgrUri = json['deskop_image'];
		fs.readFile(__dirname+'/public/css/style.css', 'utf8', (err, data) => {
			data = data.replace('%backgroundUri%', bkgrUri);
			fs.writeFile(__dirname+'/public/css/style_tmp.css', data, (err) => {
				if (err) return console.log(err);
			});
		});
	};
	var updateConfig = (changes) => {
		let field = changes[0],
			value = changes[1];
		json[field] = value;
		fs.writeFile(configFile, JSON.stringify(json), (e) => {
			if (e) console.error(e)
		})
	};
	var toChange = (json) =>{
		let toReturn = []
		switch(json['action']){
			case 'changeImg':
				updateConfig(['deskop_image', json['message']]);
				toReturn.push(json['action']);
				toReturn.push(json['message']);
				break;
			default:
				break;
		}
		return toReturn;
	};
	/*ejecución de funciones inicales*/

	//loadConfig();
	//updatebackgroundImg();

	/*metodos globales*/
	// var comunication = new EventServer(external);
	/*eventos*/

	
}
module.exports = DESKTOP;