'use strinc';

const os = require('os');
const {exec} = require('child_process');
var ifaces = os.networkInterfaces();
let address = '';
for (let o in ifaces){
	let iface = ifaces[o];
	for (let i of iface){
		if (i.internal || i.family !== 'IPv4') continue;
		console.log(i)
		address = i.address;
	}
}
console.log(address);
var start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');

exec(start + ' http://'+ address+':8080');  
