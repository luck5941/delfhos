let modalScope = {};
modalScope.generate = ( data) => {
	$(data[1]).html(data[0]);
	let scr = document.createElement("script")
	scr.type = "text/javascript";
	scr.src = "http://192.168.1.9:8080/"+data[1]+".js"
	document.body.appendChild(scr)
	$('head').append('<link rel="stylesheet" type="text/css" href="/'+data[1]+'.css">');
}

