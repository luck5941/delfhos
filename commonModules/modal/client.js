let modalScope = {};
modalScope.generate = ( data , place = '') => {
	let scr = document.createElement('script'),
		style = document.createElement('style');
	scr.innerHTML = data[0].js;
	style.innerHTML = data[0].css;
	$(data[1]).html(data[0].html);
	document.body.append(scr);
	//document.getElementsByTagName('head')[0].appendChild(style);
	$('head').append(style);
}

