var modalScope = {};
modalScope.loaded = {};
modalScope.generate = (data) => {
	if (!modalScope.loaded[data[1][0]] || (modalScope.loaded[data[1][0]].indexOf(data[1][1]) === -1 && data[1].length >1)){ //no lo tiene
		try{
			console.log(modalScope.loaded[data[1][0]].indexOf(data[1][1]));
			console.log(modalScope.loaded[data[1][0]]);
			console.log(data[1][1]);
			console.log(data[1].length);
			console.log((modalScope.loaded[data[1][0]].indexOf(data[1][1]) === -1 || data[1].length >1))
		}catch(e) {}
		modalScope.loaded[data[1][0]] = [];
		modalScope.loaded[data[1][0]].push(data[1][1])
		$(data[1][0]).addClass("module").html(data[0]);
		let scr = document.createElement("script")
		scr.type = "text/javascript";
		scr.src = "http://delfos.es/"+data[1][0]+".js"
		document.body.appendChild(scr)
		$('head').append('<link rel="stylesheet" type="text/css" href="/'+data[1][0]+'.css">');
	}
	else {
		if ($(data[1][0]).attr('class').search('minify') !== -1) {
			$(data[1][0]).removeClass("minify");
			if (window[`${data[1][0]}Scope`].isClosing)
				window[`${data[1][0]}Scope`].onInit();
			else
				$(data[1][0]).attr('style', window[`${data[1][0]}Scope`].style)
		}
		for (let m of modalScope.loaded[data[1][0]]){
			window[`${data[1]}Scope`].vueData[m] = m===data[1][1];
		}
	}
}
modalScope.closeAll = (moduleName) => {
	for (let m of modalScope.loaded[moduleName]) {
		window[`${moduleName}Scope`].vueData[m] =false;
	}
};
modalScope.onClose = () => modalScope.isClosing = true;
