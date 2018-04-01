#!/usr/bin/nodejs
const server = require('./module/server');
const Desktop = require('./module/desktop');
const io = require('socket.io');
var s = new server({"/desktop": Desktop});
s.init();
let app = s.up();
global.io = io(app);
app.listen(s.port)


