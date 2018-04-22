#!/usr/bin/nodejs
const fs = require('fs');
fs.readFile('public/css/style.css', 'utf-8', (e,d) => {
	let reg = /[\n\t\r]*\/\*#\ssourceMappingURL=(\w*\.?){3}[\n\t\r]*/
	console.log(reg.exec(d))
});

// let str = "/*# sourceMappingURL=desktop.css.map */"
