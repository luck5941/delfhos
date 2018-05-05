'use strict';
//declaración de variables
let interaction = {};
interaction.is_mobile = ((typeof window.orientation !== "undefined") || (navigator.userAgent.search(/android|iphone|ipad|phone/i) !== -1));
interaction.click_down = (this.is_mobile) ? 'touchstart' : 'mousedown';
interaction.click_up = (this.is_mobile) ? 'touchend' : 'mouseup';
interaction.click_move = (this.is_mobile) ? 'touchmove' : 'mousemove';
interaction.obj = {};
interaction.isMoving = false;
interaction.direction = false;
interaction.resizing = false;
interaction.moveOverSpace = (e) => {
	let her = $(e.currentTarget).parent();
	her.removeClass('maximify');
	interaction.isMoving = true;
	interaction.obj = {};
	interaction.obj.x = (interaction.is_mobile) ? e.originalEvent.touches[0].pageX: e.pageX;
	interaction.obj.y = (interaction.is_mobile) ? e.originalEvent.touches[0].pageY: e.pageY;
	interaction.obj.x -= parseInt(her.css('left')); 
	interaction.obj.y -= parseInt(her.css('top')); 
	interaction.obj.selected = her; 
};
interaction.desplace = (e) => {
	let Xpos = (interaction.is_mobile) ? e.originalEvent.touches[0].pageX: e.pageX,
		Ypos = (interaction.is_mobile) ? e.originalEvent.touches[0].pageY: e.pageY;
	interaction.obj.selected.css({'top': Ypos-interaction.obj.y, 'left': Xpos-interaction.obj.x});
};
interaction.unselect = (e) => {
	if (!interaction.isMoving && !interaction.direction) return null;
	interaction.obj = {};
	interaction.isMoving = false;
	interaction.direction = false;
};
interaction.canResize = (e) => {
	/*
	 *función encargada de redimensionar el tamaño de un "module" Lo primero que hace es calcular
	 * la distancia entre el click y la pared más cercana. Los nombres que van a recivir las distnacias son:
	 * l -> Distancia entre la pared izquierda y el click
	 * t -> Distancia entre la pared superior y el click
	 * r -> Distancia entre la pared derecha y el click
	 * b -> Distancia entre la pared inferior y el click
	*/
	if (interaction.isMoving) return null;
	let Xpos = (interaction.is_mobile) ? e.originalEvent.touches[0].pageX: e.pageX,
		Ypos = (interaction.is_mobile) ? e.originalEvent.touches[0].pageY: e.pageY,
		her = $(e.currentTarget),
		l = Math.abs(parseInt(her.css('left'))-Xpos),
		r = Math.abs((parseInt(her.css('width'))+parseInt(her.css('left')))- Xpos),
		t = Math.abs(parseInt(her.css('top'))-Ypos),
		b = Math.abs((parseInt(her.css('height'))+parseInt(her.css('top')))- Ypos);
	if (l<15) interaction.direction = "left";
	else if (r<15) interaction.direction = "rigth";
	else if (t<15) interaction.direction = "top";
	else if (b<15) interaction.direction = "bottom";
	else interaction.direction = false;
	interaction.obj.selected = her;
	interaction.obj.width = parseInt(her.css("width"));
	interaction.obj.height = parseInt(her.css("height"));
	interaction.obj.x = parseInt(her.css("left"));
	interaction.obj.y = parseInt(her.css("top"));
	interaction.obj.init_x = Xpos;
	interaction.obj.init_y = Ypos;
};
interaction.resize = (e) => {
	let Xpos = (interaction.is_mobile) ? e.originalEvent.touches[0].pageX: e.pageX,
		Ypos = (interaction.is_mobile) ? e.originalEvent.touches[0].pageY: e.pageY,
		newWidth = 0,
		newLeft = 0,
		newHeight = 0,
		newTop = 0,
		val = 0;
	switch(interaction.direction){
		case 'left':
			val = (Xpos-interaction.obj.init_x)*(-1);
			newWidth = val+interaction.obj.width;
			newLeft = -val+interaction.obj.x
			interaction.obj.selected.css({'width': newWidth+'px', 'left': newLeft});
			break;
		case 'rigth':
			newWidth = Xpos-interaction.obj.init_x+interaction.obj.width;
			interaction.obj.selected.css('width', newWidth+'px');
			break;
		case 'top':
			val = (Ypos-interaction.obj.init_y)*(-1);
			newheight = val+interaction.obj.height;
			newTop = -val+interaction.obj.y
			interaction.obj.selected.css({'height': newheight+'px', 'top': newTop});
			break;
		case 'bottom':
			newHeight = Ypos-interaction.obj.init_y+interaction.obj.height;
			interaction.obj.selected.css('height', newHeight+'px');
			break;
	}	
};
interaction.specialAction = (e) => {
	let action, modal, name;
	if (Array.isArray(e)){
		modal = $(e[0]);
		name = e[0];
		action = e[1];
	}
	else{
		e.stopPropagation();
		e.preventDefault();
		modal = $(e.currentTarget).parent().parent().parent(),
		name = modal[0].tagName.toLowerCase(),
		action = $(e.currentTarget).attr('class');
	}
	switch (action){
		case 'close':
			window[`${name}Scope`].onClose();
		case 'min':
			window[`${name}Scope`].style = modal.attr('style');
			modal.removeAttr("style").removeClass('maximify').addClass('minify');
			modalScope.closeAll(name);
			break;
		case 'max':
			modal.removeAttr("style").addClass('maximify');
			break;
		default:
			console.info(action);
			break;
	};
};


//declaración de eventos
$("body")
.on(interaction.click_down, "[move='true']", interaction.moveOverSpace)
.on(interaction.click_up, "[move='true'], .module body", interaction.unselect)
.on(interaction.click_down, ".module", interaction.canResize)
.on(interaction.click_up, ".module", interaction.resize)
.on(`mouse_leave, ${interaction.click_up}`, ".module", interaction.unselect)
.on(interaction.click_down, ".min, .max, .close", interaction.specialAction)
.on(interaction.click_move,(e) => (interaction.isMoving) ? interaction.desplace(e) : (interaction.direction) ? interaction.resize(e) :null)
.on(interaction.click_up, interaction.unselect)
;
