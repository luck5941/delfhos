#!/usr/bin/nodejs
const server = require('./module/server');
const Desktop = require('./module/desktop');

const s = new server({"/desktop": Desktop});
s.init();
s.up();