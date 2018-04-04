#!/usr/bin/nodejs
//Librerias
const server = require('./module/server');
const Communication  = require('./commonModules/communication');
const Database = require('./commonModules/mongoDB');
//Modulos
const Desktop = require('./module/desktop');
const Login = require('./module/login');
const FileSystem = require('./module/filesystem');

//Inicializción  de las variables
var routes = {"/desktop": Desktop, "/login": Login, "/filesystem": FileSystem}
var s = new server(routes);
global.ddbb = new Database('delfos');
//var s = new server({"/desktop": Desktop});
s.init();
ddbb.init();
global.app = s.up();
var communication = new Communication();
app.listen(s.port);
global.modules = {}

for (let o in routes)
	modules[o.slice(1)] = new routes[o];
modules["server"] = s;
