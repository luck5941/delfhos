/*comentario de prueba para que sea aquí donde pete*/
/*const $ = require('jquery');
const Whatch = require('watcher');
var EventClient = require('localEvent').Client;*/
/*Variables globales*/
var propertiesScope = {};
propertiesScope.body = $('modal');
propertiesScope.cat = propertiesScope.body.find('ul');
propertiesScope.cats = propertiesScope.cat.find('li');
propertiesScope.main = propertiesScope.body.find('main');
propertiesScope.inputName = propertiesScope.main.find("input.name");
propertiesScope.inputPermissions = propertiesScope.main.find("input[type=number]");
propertiesScope.inputText = propertiesScope.main.find(".permission");
propertiesScope.pathFile = "#{path}";
propertiesScope.nameFile = "#{name}";
/*propertiesScope.permissionCode = {
    	"property": #{permission[0]},
    	"groups":  #{permission[1]},
    	"others" : #{permission[2]}
};*/
external = {}
// var propertiesScopeWatch = new Whatch (propertiesScope.permissionCode);

/*funciones generales*/
propertiesScope.updatePermissions = (toChange = "text") => {
	let p = 'xwr',
		v = 0,
		str = ["","",""],
		input;
	for (let g in propertiesScope.permissionCode){
		o = propertiesScope.permissionCode[g];
		bin = propertiesScope.decimalToBinary(o);
		bin = bin.split("").reverse().join("");		
		input = $(propertiesScope.inputText[v+1]).find('input');
		for (let i in p){
			$(input[p.length-i-1]).prop("checked", (bin[i] === "1"))
		}
		$(propertiesScope.inputPermissions[v]).val(o)
		v++;
	};
};
propertiesScope.decimalToBinary = (x) => {
	let str  ="",
		bin = 0,
		t = 0
	x = parseInt(x)	
	while (x>0){
		bin = x%2;		
		str = bin+str;
		x = parseInt(x/2);		
	}
	t = (parseInt(str.length/8)+1)* 8
	while (str.length<t)
		str = '0'+str;
	return str;
};
/*funciones lanzadas por eventos*/
propertiesScope.changeCat = (e) => {
	alert("si que entramos!")
    let catNum = $(e.currentTarget).index('modal ul li');
    propertiesScope.cat.attr("class", `cat${catNum+1}`);
    propertiesScope.main.attr("class", `cat${catNum+1}`);
};
propertiesScope.updatePermissionsInput = (e)=>{
	let code = $(e.currentTarget).val();
	let ind = $(e.currentTarget).index("input[type=number]");
	let keys = Object.keys(propertiesScope.permissionCode);
	propertiesScope.permissionCode[keys[ind]] = code;
};
propertiesScope.updateName = (e) => {
	if (e.which === 13) // enter
		return $(e.currentTarget).blur();
	comunication.send('updateName', null, $(e.currentTarget).val());
}
propertiesScope.changeName = (e) => {
	let newName = $(propertiesScope.inputName).val();
	if (propertiesScope.nameFile === newName) return null; 
	comunication.send('prepareToChangeName', null, [propertiesScope.pathFile, propertiesScope.nameFile, newName]);
	propertiesScope.nameFile = newName;
}
propertiesScope.updatePermissionsCheck = (e) => {
	let toCheck = $(e.currentTarget).parent().find('input'),
		key = 0,
		ind = $(e.currentTarget).parent().index(".permission")-1
	for (let o of toCheck)		
		if ($(o).prop("checked"))
			key += parseInt($(o).val());
	
	propertiesScope.permissionCode[Object.keys(propertiesScope.permissionCode)[ind]] = key;
};
propertiesScope.updatePermissionsSys = () => {
	let p = Object.values(propertiesScope.permissionCode);
	comunication.send('changePermissions', null, [$("#path").text(), propertiesScope.nameFile, "0"+p.join("")]);
};

/*eventos*/
propertiesScope.cats.on('click', propertiesScope.changeCat);
propertiesScope.inputPermissions.on('change', propertiesScope.updatePermissionsInput);
propertiesScope.inputName
	.on('keyup', propertiesScope.updateName)
	.on('focusout', propertiesScope.changeName);
$("#confirm").on('click', propertiesScope.updatePermissionsSys);
$("input[type=checkbox]").on("change", propertiesScope.updatePermissionsCheck)
/*Inicializar al principio*/
propertiesScope.updatePermissions();
// for (let o in propertiesScope.permissionCode)
// propertiesScopeWatch.appendWatch(o, propertiesScope.updatePermissions);
