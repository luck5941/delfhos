#!/usr/bin/nodejs
//Librerias
const server = require('./module/server');
const Communication  = require('./commonModules/communication');
const Database = require('./commonModules/mongoDB');
const LoadApp = require("./commonModules/loadapp");
const Modal = require("./commonModules/modal");
const Chat = require('./module/chat');
//Modulos
const Desktop = require('./module/desktop');
const Login = require('./module/login');
const FileSystem = require('./module/filesystem');

//Inicializción  de las variables
var routes = {"/desktop": Desktop, "/login": Login, "/filesystem": FileSystem, "/chat": Chat}
var s = new server(routes);
global.ddbb = new Database('delfos');
s.init();
ddbb.init();
global.app = s.up();
var communication = new Communication();
app.listen(s.port);
global.modules = {};
for (let o in routes)
	global.modules[o.slice(1)] = routes[o];
modules["server"] = s;
modules["LoadApp"] = LoadApp 
modules["communication"] = communication; 
let m = new Modal(); 
modules["modal"] = m;

global.instances =  {};
global.session = {};
