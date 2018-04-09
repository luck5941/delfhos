let modalScope = {};
modalScope.generate = ( data , place = '') => {
	let scr = document.createElement('script'),
		style = document.createElement('style');
	scr.innerHTML = data.js;
	style.innerHTML = data.css;
	$('filesystem').html(data.html);
	document.body.append(scr);
	//document.getElementsByTagName('head')[0].appendChild(style);
	$('head').append(style);
}

