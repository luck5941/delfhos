'use strict'
let loginScope = {};
loginScope.form = $('login form');
loginScope.input = $('login input');
loginScope.sendForm = (e) => {
	console.log("entra")
	e.preventDefault();
	formObj = {};
	formObj.user = $(loginScope.input[0]).val();
	formObj.passwd = $(loginScope.input[1]).val();
	comunication.send('form', formObj, "newUser")
};
loginScope.form.on('submit', loginScope.sendForm);
