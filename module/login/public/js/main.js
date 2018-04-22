'use strict'
var loginScope = {};
loginScope.form = $('login form');
loginScope.input = $('login input');
loginScope.data = {}
loginScope.data.message = "";
loginScope.vue = new Vue({el: '#root', data: loginScope.data});
loginScope.sendForm = (e) => {
	let method = $(e.currentTarget).attr('id');
	let input = $(e.currentTarget).find('input');
	e.preventDefault();

	let formObj = {};
	for (let i of input)
		if ($(i).attr('type') !== 'submit')
			formObj[$(i).attr('name')] = $(i).val()
	if (method === 'login') formObj.id = document.cookie;
	comunication.send('event', formObj, 'login', method, 'loginScope', 'loginFunct')
};

loginScope.form.on('submit', loginScope.sendForm);
loginScope.loginFunct = (data) =>{
	console.log(data);
	if (data.access){
		return window.location.href = "desktop";
	}
	else return loginScope.data.message = "Contraseño o contraseña incorrecta";
};
