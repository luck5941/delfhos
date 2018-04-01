'use strict';

(function (localevent) {

	// IPC RENDERER
	localevent.Client = function(win) {
		this.win  = win;
		const {ipcRenderer} = require('electron');
		ipcRenderer.on('event', (e, args)=> {
			this.win[args[0]](args[1]);
		});
		this.send = function (func1, func2, args){			
			ipcRenderer.send('event', [func1, func2, args]);
		};
	};
	//IPC MAIN
	localevent.Server = function(win) {
		this.win  = win;
		const {ipcMain} = require('electron');
		ipcMain.on('event', (e, args) => {
			let toSend = this.win[args[0]](args[2]);
			if (args[1] !== null)
				e.sender.send('event',[args[1], toSend]);
		});
		this.send = function(broser, ...args) {
			broser.webContents.send('event', args);
		}
	}
	return localevent;
})(typeof exports === "undefined" ? utilidades = {} : exports);
