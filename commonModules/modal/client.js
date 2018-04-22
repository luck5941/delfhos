let modalScope = {};
modalScope.generate = ( data) => {
	$(data[1]).html(data[0]);
	$('body').append('<script type="text/javascript" src="/'+data[1]+'.js"></script>');
	$('head').append('<link rel="stylesheet" type="text/css" href="/'+data[1]+'.css">');
}

