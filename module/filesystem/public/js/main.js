'use strict';
/*Variables globales*/
var mainScope = {};
mainScope.contentMenuConstruct = {
	".folder": {
		"Abrir": "mainScope.goInto",
		"Enviar a la papelera de reciclaje": "mainScope.sentToTrush",
		"Cambiar nombre": "mainScope.changeName",
		"Borrar permanentemente": "mainScope.remove",
		"Cortar": "mainScope.prepareToCut",
		"Copiar": "mainScope.prepareToCopy",
		"Propiedades": "mainScope.askForProperties"
	},
	".file": {
		"Enviar a la papelera de reciclaje": "mainScope.sentToTrush",
		"Cambiar nombre": "mainScope.changeName",
		"Borrar permanentemente": "mainScope.remove",
		"Cortar": "mainScope.prepareToCut",
		"Copiar": "mainScope.prepareToCopy",
		"Propiedades": "mainScope.askForProperties"
	}
};
contextMenu.updateMenu(mainScope.contentMenuConstruct);
mainScope.ctrlPress = false;
mainScope.isCopping = false;
mainScope.selected = {"file": [], "folder": []};
mainScope.toCopy = {"file": [], "folder": []};
mainScope.mapKey = {};
mainScope.currentPath = '';
mainScope.vueData = {dir: [], fil: [], currentPath:[]};
	
mainScope.vue = new Vue({el: 'filesystem', data: mainScope.vueData, computed:{
	getPath: function(){
		let availabesExt = ['jpg', 'png', 'svg', 'jpeg', 'gif'];
		let arr = []
		let ext = '';
		let toPush = ''
		for (let f of this.fil){
			arr.push({});
			arr.slice(-1)[0].name = f;
			ext = f.split(".").slice(-1)[0];
			toPush = (availabesExt.indexOf(ext) === -1) ? "common/images/file.jpg" : `${this.currentPath.join("/")}${f}`;	
			console.log(toPush);
			arr.slice(-1)[0].path = toPush;
		}
		console.log(arr);
		return arr;
	}
}});


/*metodos locales*/
mainScope.drawFiles = (args) => {
	/*Lista los archivos y carpetas que hay en ese direcorio*/	
	let str = args[0];
	for (let p in args[0])
		mainScope.vueData[p] = args[0][p]
	/*Cambia el menú de navegación */
	if (args.length >=2){
		let path = args[1];
		mainScope.vueData.currentPath = path;
		mainScope.currentPath = path.join("/");
		mainScope.currentPath = (mainScope.currentPath.search(/\/$/) !== -1) ? mainScope.currentPath : mainScope.currentPath +"/"; 
	}
};
mainScope.changeName = (name) => {
	if (mainScope.selected["file"].length >0) 
		$(mainScope.selected["file"][0]).find('p').text(name)
	else if (mainScope.selected["folder"].length >0) 
		$(mainScope.selected["folder"][0]).find('p').text(name)
};
mainScope.unselectOne = (name) => {
	/*
	 *Metodo encargado de borrar de la lista de elementos seleccionados
	 *uno de los elementos. Para ello busca cual tiene el mismo texto,
	 *es decir, el nombre del archivo y cuando lo encuentra, borra el
	 *el indice que tenga de la lista y le quita el inidicativo de estar
	 *seleccionado
	*/
	for (let f in mainScope.selected)
		for (let i =0;i<mainScope.selected[f].length; i++)
			if ($(mainScope.selected[f][i]).find("p").html() === name){
				$(mainScope.selected[f][i]).removeClass("selected")
				mainScope.selected[f].splice(i, i);
				return null;
			}
};
mainScope.deleteRenderMove = (toDel) => {
	/*
	 *Función que permite la desaparición de los arhivo o carpeta una vez movidos o borrados
	*/
	for (let f in toDel){
		for (let i = toDel[f].length-1; i>=0; i--){
			$(toDel[f][i]).remove();
			toDel[f].pop();
		}
	}
};
mainScope.evalKeyMap = () =>{
	if (mainScope.mapKey[17] && mainScope.mapKey[67]){ //press cntrl +c
		mainScope.prepareToCopy()
	}
	else if (mainScope.mapKey[17] && mainScope.mapKey[86]){ // press cntl +v
		mainScope.paste()
	}
	else if (mainScope.mapKey[17] && mainScope.mapKey[88]){ // press cntl +x
		mainScope.prepareToCut();
	}
	else if (mainScope.mapKey[113]) //press f2
		mainScope.changeName();
	else if (mainScope.mapKey[46] && mainScope.mapKey[16]) // press shift + supr
		mainScope.remove();
	else if (mainScope.mapKey[46]) //press supr
		mainScope.sentToTrush();
	else if (/*mainScope.mapKey[17] &&*/ mainScope.mapKey[73]) // press cntrl + i
		mainScope.askForProperties();
};
mainScope.getName = (src) => {
	/*
	 * Esta función se encarga de devolver un array con los nombres
	 * de todos los elementos seleccionados
	 * src:Object
	 * devuelve el array
	*/
	
	let toCopy = [];
	for (let f in src)
		for (let i = 0; i<src[f].length; i++){
			toCopy.push(mainScope.currentPath+$(src[f][i]).find("p").html());
		}
	return toCopy;
};
mainScope.sentTo = (dst, src = mainScope.selected)=> {
	/*
	 * Esta función se encarga de preparar para mover o copiar los archivos
	 * dst:String Ruta de la carpeta que contendrá lo que se va a copiar o mover
	 * src:[String] Rutas de los archivs que se quieren mover
	 * src:Object Nombres de los archivos y carpetas que se van a mover (Deber tratarse sólo la primera opción) <- deprecated
	*/
	let toCopy = [],
		action = (mainScope.isCopping) ? "copy" : "move";
	toCopy = (!Array.isArray(src)) ? mainScope.getName(src) : src;
	comunication.send('event', [toCopy, dst], 'filesystem', action, 'mainScope', 'drawFiles');
};
mainScope.prepareToCopy = () => {
	mainScope.toCopy = mainScope.getName(mainScope.selected);
	mainScope.isCopping = true;
};
mainScope.prepareToCut = () => {
	mainScope.toCopy = mainScope.getName(mainScope.selected)
	mainScope.isCopping = false;
};
mainScope.paste = () => {
	let dst = mainScope.currentPath
	if (mainScope.selected['folder'][0]) dst += $(mainScope.selected['folder'][0]).find("p").html()+"/";
	mainScope.sentTo(dst, mainScope.toCopy);
};
mainScope.sentToTrush = () => {
	mainScope.prepareToCut();
	mainScope.sentTo('trash', mainScope.toCopy);
};
mainScope.remove = () => {
	mainScope.prepareToCut();
	let toDel = mainScope.toCopy;
	comunication.send('event',null , 'filesystem','remove' , 'mainScope', 'drawFiles');
};
mainScope.askForProperties = () => {
	let names = mainScope.getName(mainScope.selected)
	comunication.send('event',names , 'filesystem','getProperties' , 'mainScope', null);
	//comunication.send('getProperties', null, names)
};
mainScope.sendFiles = (file) => {
	/*
	 * Metodo encargado de leer y enviar los archivos al servidor
	 * file es un solo importante, independientemente de todos los que se quieran enviar
	*/
	let reader = new FileReader(),
		fileObj = {};
	fileObj.name = file.name;
	reader.onload = (e) => {
		fileObj.data = e.target.result;
		comunication.send('event', [fileObj], 'filesystem', 'getFiles', 'mainScope', 'drawFiles');
	}
	reader.readAsBinaryString(file);
};
mainScope.startDownload = (name) => {
	console.log(name)
	window.location.href = "download?name="+name[0];
}


/*metodos locales llamados por eventos*/
mainScope.goInto = (e)=> {
	/*
	 *funcion encarga de mandar el evento necesario que determina que
	 *carpeta quieren abrir
	*/
	let name = '';
	try{
		name = $(e.currentTarget).find('p').html();
	}catch (e){
		name = mainScope.selected['folder'];
		name = name[name.length-1].find("p").html();
	}
	mainScope.currentPath += name + "/";
	mainScope.vueData.currentPath = mainScope.currentPath.split("/");
	mainScope.selected = {"file": [], "folder": []};
	comunication.send('event', [name], 'filesystem', 'loadFiles');
};
mainScope.goFolderTopBar = (e)=>{
	/*
	 *Funcion encarga de enviar el evento para indicar a que carpeta del camino
	 *de migas de pan generado en la topbar se quiere ir
	*/
	e.stopPropagation();
	let name = $(e.currentTarget).html();
	comunication.send('event', name, 'filesystem', 'changeDir', 'mainScope', 'drawFiles');
};
mainScope.showName = (e)=> {
	/*mostrar el texto completo de la carpeta  o archivo*/
	$(e.currentTarget).find('p').removeClass('ellipsis');
};
mainScope.hideName = (e)=> {
	/*volver a ocultar el texto completo de la carpeta  o archivo*/
	$(e.currentTarget).find('p').addClass('ellipsis');
};
mainScope.select = (e)=> {
	/*
	 *Esta función se encarga de:
	 *seleccionar o deseleccionar carpeta o archivos
	*/
	if (e.which === 2) return;	
	// si no está pulsado cntr y no se está arrastrando, se deselecciona
	if (!mainScope.ctrlPress && e.originalEvent.type !== "dragstart") mainScope.unselect();
	// Si el elemento ya estába se seleccionado, se sale de la función deseleccionado el elemento
	if ($(e.currentTarget).attr("class").search("selected") !== -1)
		return mainScope.unselectOne($(e.currentTarget).find("p").html());
	//la clase indica si se trata de una carpeta o un archivo
	let type = $(e.currentTarget).attr("class").split(" ")[0];
	mainScope.selected[type].push($(e.currentTarget));
	$(e.currentTarget).addClass('selected');
};
mainScope.onDrag = (e) => {
	/*
	 *Función encargada de posicionar en un lugar concreto los elementos seleccionados
	*/
	let x = e.clientX, y = e.clientY;
	for (let f in mainScope.selected)
		for (let i = 0; i< f.length; i++)
			$(mainScope.selected[f][i]).addClass("moving").css({"top": y+50, "left": x-50});
};
mainScope.endDrag = (e) => {
	/*
	 *Función encargada de determinar la posicón que han de tomar los elementos arrastrados
	*/
	let x = e.clientX, y = e.clientY;
	for (let f in mainScope.selected)
		for (let i = 0; i< f.length; i++)
			$(mainScope.selected[f][i]).css({"top": y, "left": x+i*$(mainScope.selected[f][i]).width()});
	mainScope.unselect();
};
mainScope.endDrop = (e) =>{
	/*
	 *Metodo encargado de determinar si se ha soltado en un carpeta o archivo
	 *distinto a  los seleccionados. Cuando encuentre una coincidencia se sale
	 *ya que implica que no se quiere copiar o mover el/los archivos selecionados
	 *Se trata de una función de prevención. No debería encontrar nunca una coincidencia
	*/
	e.preventDefault();
	for (let f in mainScope.selected)
		for (var i = 0; i< f.length; i++)
			if ($(e.currentTarget).index("ul li") === $(mainScope.selected[f][i]).index("ul li"))
				return;
	if (mainScope.ctrlPress) mainScope.isCopping = true;
	mainScope.sentTo(mainScope.currentPath+ $(e.currentTarget).find("p").html()+"/")
};
mainScope.unselect = () => {
	/*
	 *Función que permite la deselección de un arhivo o carpeta
	*/	
	for (let f in mainScope.selected){
		for (let i = mainScope.selected[f].length-1; i>=0; i--){
			$(mainScope.selected[f][i]).removeClass("selected");			
		}
	}
	mainScope.selected = {"file": [], "folder": []};
};
mainScope.changeName = (e) => {
	let cont = (mainScope.selected['file'].length >=1) ? 'file': 'folder',
		name =  $(mainScope.selected[cont][0]).find('p').html();
	$(mainScope.selected[cont][0]).find('p').attr({"contenteditable": "true", "name": name}).focus();
}
mainScope.aceptName = (e) => {
	if (e.keyCode !== 13) return;
	e.preventDefault();
	let name = $(e.currentTarget).html(),
		toRename = [],
		extMode = '',
		ext = []
	for (let f of ["file", "folder"]){
		for (let o of mainScope.selected[f])
			toRename.push(($(o).find("p").attr("name")) ? $(o).find("p").attr("name") : $(o).find("p").html());
	}
	//ext1 = $(e.currentTarget).attr("name").split(".").slice(-1).join("."), $(e.currentTarget).html().split(".").slice(-1).join(".")];
	let ext1 = $(e.currentTarget).attr("name").split("."),
		ext2 = name.split(".");
	ext.push((ext1.length >=2)? ext1.slice(-1)[0]:'');
	ext.push((ext2.length >=2)? ext2.slice(-1)[0]:'');
	extMode = (ext[0] == ext[1]) ? false : ext[0];	
	comunication.send('event', [toRename, name, extMode], 'filesystem', 'rename', 'mainScope', 'drawFiles');
};
mainScope.pressKey = (e)=> {
	mainScope.ctrlPress = (e.keyCode === 17) ? true : false;
	mainScope.mapKey[e.keyCode] = true;
	mainScope.evalKeyMap();
	console.log(e.keyCode);
};
mainScope.keyUp = (e)=>  {
	if (e.keyCode === 17) mainScope.ctrlPress = false;
	mainScope.mapKey[e.keyCode] = false;
};
mainScope.requestFiles = (e) => {
	if (!e.originalEvent.dataTransfer)return; 
	if (!e.originalEvent.dataTransfer.files.length) return;
	let files = e.originalEvent.dataTransfer.files;	
	for (let f of files)
		mainScope.sendFiles(f);
};
mainScope.newFolder = () =>{
	/*
	*Metodo encargado de generar una nueva carpeta.
	*Cuando termine, vuelve a se actualiza la lista de archivios
	*/
	comunication.send('event', [''], 'filesystem', 'newFolder', 'mainScope', 'drawFiles');
};
mainScope.download = () => {
	let files = mainScope.getName(mainScope.selected);
	comunication.send('event', [files], 'filesystem', 'preparedDownload', 'mainScope', 'startDownload');

};

/*control de eventos*/
$('body')
.on('dblclick', '.folder', mainScope.goInto)
.on('dblclick', '.track', mainScope.goFolderTopBar)
.on('mouseover', '.folder, .file', mainScope.showName)
.on('mouseout', '.folder, .file', mainScope.hideName)
.on('mousedown', '.folder, .file', mainScope.select)
.on('dragstart', '.folder, .file', mainScope.select)
.on('drag', '.folder, .file', mainScope.onDrag)
.on('dragend', '.folder, .file', mainScope.endDrag)
.on('dragover', '.folder, .file', (e)=>{e.preventDefault();})
.on('drop', '.folder, file', mainScope.endDrop)
.on('mousedown', '.elements', mainScope.unselect)
.on('keydown', mainScope.pressKey)
.on('keyup', mainScope.keyUp)
.on('keydown', '[contenteditable="true"]', mainScope.aceptName)
.on('click', '#newFolder', mainScope.newFolder)
.on('click', '#download', mainScope.download)
.on('dragover, dragenter', 'main', (e) => {e.preventDefault();e.stopPropagation(); })
.on('drop', 'main', mainScope.requestFiles);
$(document).ready(()=> comunication.send('event', [''], 'filesystem', 'initialLoad', 'mainScope', 'drawFiles'));
window.addEventListener("dragover",function(e){
  e = e || event;
  e.preventDefault();
},false);
window.addEventListener("drop",function(e){
  e = e || event;
  e.preventDefault();
	console.log(e);
},false);
