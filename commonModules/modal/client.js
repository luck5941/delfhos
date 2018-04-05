let modalScope = {};
modalScope.generate = ( data , place = '') => {
	console.log("entra en generate");
	let scr = document.createElement('script'),
		style = document.createElement('style');
	scr.innerHTML = data.js;
	style.innerHTML = data.css;
	document.body.appendChild(scr);
	document.getElementsByTagName('head')[0].appendChild(style);
	$('filesystem').html(data.html);
}

