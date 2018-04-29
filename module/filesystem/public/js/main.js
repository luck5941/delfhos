/*Variables globales*/
var filesystemScope = {};
filesystemScope.contentMenuConstruct = {
	".folder": {
		"Abrir": "filesystemScope.goInto",
		"Enviar a la papelera de reciclaje": "filesystemScope.sentToTrush",
		"Cambiar nombre": "filesystemScope.changeName",
		"Borrar permanentemente": "filesystemScope.remove",
		"Cortar": "filesystemScope.prepareToCut",
		"Copiar": "filesystemScope.prepareToCopy",
		"Propiedades": "filesystemScope.askForProperties"
	},
	".file": {
		"Enviar a la papelera de reciclaje": "filesystemScope.sentToTrush",
		"Cambiar nombre": "filesystemScope.changeName",
		"Borrar permanentemente": "filesystemScope.remove",
		"Cortar": "filesystemScope.prepareToCut",
		"Copiar": "filesystemScope.prepareToCopy",
		"Propiedades": "filesystemScope.askForProperties"
	}
};

filesystemScope.ctrlPress = false;
filesystemScope.isCopping = false;
filesystemScope.selected = {"file": [], "folder": []};
filesystemScope.toCopy = {"file": [], "folder": []};
filesystemScope.mapKey = {};
filesystemScope.currentPath = '';
filesystemScope.vueData = {dir: [], fil: [], currentPath:[]};

/*metodos locales*/
filesystemScope.drawFiles = (args) => {
	/*Lista los archivos y carpetas que hay en ese direcorio*/	
	let str = args[0];
	for (let p in args[0])
		filesystemScope.vueData[p] = args[0][p]
	/*Cambia el menú de navegación */
	if (args.length >=2){
		let path = args[1];
		filesystemScope.vueData.currentPath = path;
		filesystemScope.currentPath = path.join("/");
		filesystemScope.currentPath = (filesystemScope.currentPath.search(/\/$/) !== -1) ? filesystemScope.currentPath : filesystemScope.currentPath +"/"; 
	}
};
filesystemScope.changeName = (name) => {
	if (filesystemScope.selected["file"].length >0) 
		$(filesystemScope.selected["file"][0]).find('p').text(name)
	else if (filesystemScope.selected["folder"].length >0) 
		$(filesystemScope.selected["folder"][0]).find('p').text(name)
};
filesystemScope.unselectOne = (name) => {
	/*
	 *Metodo encargado de borrar de la lista de elementos seleccionados
	 *uno de los elementos. Para ello busca cual tiene el mismo texto,
	 *es decir, el nombre del archivo y cuando lo encuentra, borra el
	 *el indice que tenga de la lista y le quita el inidicativo de estar
	 *seleccionado
	*/
	for (let f in filesystemScope.selected)
		for (let i =0;i<filesystemScope.selected[f].length; i++)
			if ($(filesystemScope.selected[f][i]).find("p").html() === name){
				$(filesystemScope.selected[f][i]).removeClass("selected")
				filesystemScope.selected[f].splice(i, i);
				return null;
			}
};
filesystemScope.deleteRenderMove = (toDel) => {
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
filesystemScope.evalKeyMap = () =>{
	if (filesystemScope.mapKey[17] && filesystemScope.mapKey[67]){ //press cntrl +c
		filesystemScope.prepareToCopy()
	}
	else if (filesystemScope.mapKey[17] && filesystemScope.mapKey[86]){ // press cntl +v
		filesystemScope.paste()
	}
	else if (filesystemScope.mapKey[17] && filesystemScope.mapKey[88]){ // press cntl +x
		filesystemScope.prepareToCut();
	}
	else if (filesystemScope.mapKey[113]) //press f2
		filesystemScope.changeName();
	else if (filesystemScope.mapKey[46] && filesystemScope.mapKey[16]) // press shift + supr
		filesystemScope.remove();
	else if (filesystemScope.mapKey[46]) //press supr
		filesystemScope.sentToTrush();
	else if (/*filesystemScope.mapKey[17] &&*/ filesystemScope.mapKey[73]) // press cntrl + i
		filesystemScope.askForProperties();
};
filesystemScope.getName = (src) => {
	/*
	 * Esta función se encarga de devolver un array con los nombres
	 * de todos los elementos seleccionados
	 * src:Object
	 * devuelve el array
	*/
	
	let toCopy = [];
	for (let f in src)
		for (let i = 0; i<src[f].length; i++){
			toCopy.push(filesystemScope.currentPath+$(src[f][i]).find("p").html());
		}
	return toCopy;
};
filesystemScope.sentTo = (dst, src = filesystemScope.selected)=> {
	/*
	 * Esta función se encarga de preparar para mover o copiar los archivos
	 * dst:String Ruta de la carpeta que contendrá lo que se va a copiar o mover
	 * src:[String] Rutas de los archivs que se quieren mover
	 * src:Object Nombres de los archivos y carpetas que se van a mover (Deber tratarse sólo la primera opción) <- deprecated
	*/
	let toCopy = [],
		action = (filesystemScope.isCopping) ? "copy" : "move";
	toCopy = (!Array.isArray(src)) ? filesystemScope.getName(src) : src;
	comunication.send('event', [toCopy, dst], 'filesystem', action, 'filesystemScope', 'drawFiles');
};
filesystemScope.prepareToCopy = () => {
	filesystemScope.toCopy = filesystemScope.getName(filesystemScope.selected);
	filesystemScope.isCopping = true;
};
filesystemScope.prepareToCut = () => {
	filesystemScope.toCopy = filesystemScope.getName(filesystemScope.selected)
	filesystemScope.isCopping = false;
};
filesystemScope.paste = () => {
	let dst = filesystemScope.currentPath
	if (filesystemScope.selected['folder'][0]) dst += $(filesystemScope.selected['folder'][0]).find("p").html()+"/";
	filesystemScope.sentTo(dst, filesystemScope.toCopy);
};
filesystemScope.sentToTrush = () => {
	filesystemScope.prepareToCut();
	filesystemScope.sentTo('trash', filesystemScope.toCopy);
};
filesystemScope.remove = () => {
	filesystemScope.prepareToCut();
	let toDel = filesystemScope.toCopy;
	comunication.send('event',toDel , 'filesystem','remove' , 'filesystemScope', 'drawFiles');
};
filesystemScope.askForProperties = () => {
	let names = filesystemScope.getName(filesystemScope.selected)
	comunication.send('event',names , 'filesystem','getProperties' , 'filesystemScope', null);
	//comunication.send('getProperties', null, names)
};
filesystemScope.sendFiles = (file) => {
	/*
	 * Metodo encargado de leer y enviar los archivos al servidor
	 * file es un solo importante, independientemente de todos los que se quieran enviar
	*/
	let reader = new FileReader(),
		fileObj = {};
	fileObj.name = file.name;
	reader.onload = (e) => {
		fileObj.data = e.target.result;
		comunication.send('event', [fileObj], 'filesystem', 'getFiles', 'filesystemScope', 'drawFiles');
	}
	reader.readAsBinaryString(file);
};
filesystemScope.startDownload = (name) => {
	console.log(name)
	window.location.href = "download?name="+name[0];
}

/*metodos locales llamados por eventos*/
filesystemScope.goInto = (e)=> {
	/*
	 *funcion encarga de mandar el evento necesario que determina que
	 *carpeta quieren abrir
	*/
	console.log("me llaman")
	let name = '';
	try{
		name = $(e.currentTarget).find('p').html();
	}catch (e){
		name = filesystemScope.selected['folder'];
		name = name[name.length-1].find("p").html();
	}
	filesystemScope.currentPath += name + "/";
	filesystemScope.vueData.currentPath = filesystemScope.currentPath.split("/");
	filesystemScope.selected = {"file": [], "folder": []};
	comunication.send('event', [name], 'filesystem', 'loadFiles');
};
filesystemScope.goFolderTopBar = (e)=>{
	/*
	 *Funcion encarga de enviar el evento para indicar a que carpeta del camino
	 *de migas de pan generado en la topbar se quiere ir
	*/
	let name = '';
	if (typeof e !== 'string'){
		e.stopPropagation();
		name = $(e.currentTarget).html();
	}
	else name = e;
	comunication.send('event', name, 'filesystem', 'changeDir', 'filesystemScope', 'drawFiles');
	console.log(name)
};
filesystemScope.showName = (e)=> {
	/*mostrar el texto completo de la carpeta  o archivo*/
	$(e.currentTarget).find('p').removeClass('ellipsis');
};
filesystemScope.hideName = (e)=> {
	/*volver a ocultar el texto completo de la carpeta  o archivo*/
	$(e.currentTarget).find('p').addClass('ellipsis');
};
filesystemScope.select = (e)=> {
	/*
	 *Esta función se encarga de:
	 *seleccionar o deseleccionar carpeta o archivos
	*/
	if (e.which === 2) return;	
	// si no está pulsado cntr y no se está arrastrando, se deselecciona
	if (!filesystemScope.ctrlPress && e.originalEvent.type !== "dragstart") filesystemScope.unselect();
	// Si el elemento ya estába se seleccionado, se sale de la función deseleccionado el elemento
	if ($(e.currentTarget).attr("class").search("selected") !== -1)
		return filesystemScope.unselectOne($(e.currentTarget).find("p").html());
	//la clase indica si se trata de una carpeta o un archivo
	let type = $(e.currentTarget).attr("class").split(" ")[0];
	filesystemScope.selected[type].push($(e.currentTarget));
	$(e.currentTarget).addClass('selected');
};
filesystemScope.onDrag = (e) => {
	/*
	 *Función encargada de posicionar en un lugar concreto los elementos seleccionados
	*/
	let x = e.clientX, y = e.clientY;
	for (let f in filesystemScope.selected)
		for (let i = 0; i< f.length; i++)
			$(filesystemScope.selected[f][i]).addClass("moving").css({"top": y+50, "left": x-50});
};
filesystemScope.endDrag = (e) => {
	/*
	 *Función encargada de determinar la posicón que han de tomar los elementos arrastrados
	*/
	let x = e.clientX, y = e.clientY;
	for (let f in filesystemScope.selected)
		for (let i = 0; i< f.length; i++)
			$(filesystemScope.selected[f][i]).css({"top": y, "left": x+i*$(filesystemScope.selected[f][i]).width()});
	filesystemScope.unselect();
};
filesystemScope.endDrop = (e) =>{
	/*
	 *Metodo encargado de determinar si se ha soltado en un carpeta o archivo
	 *distinto a  los seleccionados. Cuando encuentre una coincidencia se sale
	 *ya que implica que no se quiere copiar o mover el/los archivos selecionados
	 *Se trata de una función de prevención. No debería encontrar nunca una coincidencia
	*/
	e.preventDefault();
	for (let f in filesystemScope.selected)
		for (var i = 0; i< f.length; i++)
			if ($(e.currentTarget).index("ul li") === $(filesystemScope.selected[f][i]).index("ul li"))
				return;
	if (filesystemScope.ctrlPress) filesystemScope.isCopping = true;
	filesystemScope.sentTo(filesystemScope.currentPath+ $(e.currentTarget).find("p").html()+"/")
};
filesystemScope.unselect = () => {
	/*
	 *Función que permite la deselección de un arhivo o carpeta
	*/	
	for (let f in filesystemScope.selected){
		for (let i = filesystemScope.selected[f].length-1; i>=0; i--){
			$(filesystemScope.selected[f][i]).removeClass("selected");			
		}
	}
	filesystemScope.selected = {"file": [], "folder": []};
};
filesystemScope.changeName = (e) => {
	let cont = (filesystemScope.selected['file'].length >=1) ? 'file': 'folder',
		name =  $(filesystemScope.selected[cont][0]).find('p').html();
	$(filesystemScope.selected[cont][0]).find('p').attr({"contenteditable": "true", "name": name}).focus();
}
filesystemScope.aceptName = (e) => {
	if (e.keyCode !== 13) return;
	e.preventDefault();
	let name = $(e.currentTarget).html(),
		toRename = [],
		extMode = '',
		ext = []
	for (let f of ["file", "folder"]){
		for (let o of filesystemScope.selected[f])
			toRename.push(($(o).find("p").attr("name")) ? $(o).find("p").attr("name") : $(o).find("p").html());
	}
	//ext1 = $(e.currentTarget).attr("name").split(".").slice(-1).join("."), $(e.currentTarget).html().split(".").slice(-1).join(".")];
	let ext1 = $(e.currentTarget).attr("name").split("."),
		ext2 = name.split(".");
	ext.push((ext1.length >=2)? ext1.slice(-1)[0]:'');
	ext.push((ext2.length >=2)? ext2.slice(-1)[0]:'');
	extMode = (ext[0] == ext[1]) ? false : ext[0];	
	comunication.send('event', [toRename, name, extMode], 'filesystem', 'rename', 'filesystemScope', 'drawFiles');
};
filesystemScope.pressKey = (e)=> {
	filesystemScope.ctrlPress = (e.keyCode === 17) ? true : false;
	filesystemScope.mapKey[e.keyCode] = true;
	filesystemScope.evalKeyMap();
	console.log(e.keyCode);
};
filesystemScope.keyUp = (e)=>  {
	if (e.keyCode === 17) filesystemScope.ctrlPress = false;
	filesystemScope.mapKey[e.keyCode] = false;
};
filesystemScope.requestFiles = (e) => {
	if (!e.originalEvent.dataTransfer)return; 
	if (!e.originalEvent.dataTransfer.files.length) return;
	let files = e.originalEvent.dataTransfer.files;	
	for (let f of files)
		filesystemScope.sendFiles(f);
};
filesystemScope.newFolder = () =>{
	/*
	*Metodo encargado de generar una nueva carpeta.
	*Cuando termine, vuelve a se actualiza la lista de archivios
	*/
	comunication.send('event', [''], 'filesystem', 'newFolder', 'filesystemScope', 'drawFiles');
};
filesystemScope.download = () => {
	let files = filesystemScope.getName(filesystemScope.selected);
	comunication.send('event', [files], 'filesystem', 'preparedDownload', 'filesystemScope', 'startDownload');

};

/*control de eventos*/
$('body')
.on('dblclick', '.folder', filesystemScope.goInto)
.on('dblclick', '.track', filesystemScope.goFolderTopBar)
.on('mouseover', '.folder, .file', filesystemScope.showName)
.on('mouseout', '.folder, .file', filesystemScope.hideName)
.on('mousedown', '.folder, .file', filesystemScope.select)
.on('dragstart', '.folder, .file', filesystemScope.select)
.on('drag', '.folder, .file', filesystemScope.onDrag)
.on('dragend', '.folder, .file', filesystemScope.endDrag)
.on('dragover', '.folder, .file', (e)=>{e.preventDefault();})
.on('drop', '.folder, file', filesystemScope.endDrop)
.on('mousedown', '.elements', filesystemScope.unselect)
.on('keydown', filesystemScope.pressKey)
.on('keyup', filesystemScope.keyUp)
.on('keydown', '[contenteditable="true"]', filesystemScope.aceptName)
.on('click', '#newFolder', filesystemScope.newFolder)
.on('click', '#download', filesystemScope.download)
.on('dragover, dragenter', 'main', (e) => {e.preventDefault();e.stopPropagation(); })
.on('drop', 'main', filesystemScope.requestFiles);
$(document).ready(()=> comunication.send('event', [''], 'filesystem', 'initialLoad', 'filesystemScope', 'drawFiles'));
window.addEventListener("dragover",function(e){
  e = e || event;
  e.preventDefault();
},false);
window.addEventListener("drop",function(e){
  e = e || event;
  e.preventDefault();
	console.log(e);
},false);

filesystemScope.vue = new Vue({
	el: 'filesystem',
	data: filesystemScope.vueData,
	computed:{
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
	},
	methods: {
		goFolderTopBar: filesystemScope.goFolderTopBar
	}
});
contextMenu.updateMenu(filesystemScope.contentMenuConstruct);