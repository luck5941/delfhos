let modalScope = {};
modalScope.generate = ( data) => {
	if ($(data[1]).attr('class'))
		if ($(data[1]).attr('class').search('minify') !== -1) {
			$(data[1]).removeClass("minify");
			if (window[`${data[1]}Scope`].isClosing)
				window[`${data[1]}Scope`].onInit();
			else
				$(data[1]).attr('style', window[`${data[1]}Scope`].style)
			return;
		}
	$(data[1]).addClass("module").html(data[0]);
	let scr = document.createElement("script")
	scr.type = "text/javascript";
	scr.src = "http://delfos.es/"+data[1]+".js"
	document.body.appendChild(scr)
	$('head').append('<link rel="stylesheet" type="text/css" href="/'+data[1]+'.css">');
}

