'use strict';
var selectfile = {
	Render : function() {
		var Whatch =  require('./../../../commonModules/watcher');
		var selectFileScope = {};
		var mainScopeWatch = new Whatch (mainScope);
		$('script').eq(0).before(`<footer><form><p>ruta:</p><input type="text" name="path" value="${mainScope.currentPath}"><input type="submit" name="aceptar" value="aceptar"></form></footer>`);
		/*metodos locales*/
		selectFileScope.changeInput = () => {
			$('footer input').eq(0).val(mainScope.currentPath);
		};

		/*metodos locales llamados por eventos*/
		selectFileScope.selectFile = (e) => {
			e.preventDefault();
			let selectFile = mainScope.currentPath + $(mainScope.selected["file"][0]).find('p').html();
			comunication.send('sendSelecction', null, selectFile);
		};

		$('body')
		.on('click', 'form input[type="submit"]', selectFileScope.selectFile);
		mainScopeWatch.appendWatch("currentPath", selectFileScope.changeInput);
	},

	Main: function (argument) {
		var sendSelecction;
		var external = this.external,
			app = this.app;
		external.sendSelecction = sendSelecction = (path) => {
			let message = {
				"from": "fileSystem > selectFile",
				"action": "changeImg",
				"message": path
			};
			message = JSON.stringify(message);
			console.log(message)
			app.quit()
		};
		
	}
};
module.exports = exports = selectfile;