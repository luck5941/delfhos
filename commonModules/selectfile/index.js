'use strict';
var selectfile = {
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
