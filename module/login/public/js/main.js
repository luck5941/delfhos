'use strict'

//Declaración de la variables
var loginScope = {};
loginScope.keyPressed = {};
loginScope.vueData = {}
loginScope.vueMethods = {}
//declaración de las variables necesarias para las acciones realizadas con vue
loginScope.vueData.message = "";
loginScope.vueData.form = {newUser:[
	{name: "user", placeholder:"El nick con el que quieres que te conozca", type: "text", required: "true", val:""}, 
	{name: "name", placeholder:"tu nombre", type: "text", val:""}, 
	{name: "birthday", placeholder:"mm/dd/aaaa", type: "text", required: "true", pattern: "^([1-9]|1[0-2])\\/([1-9]|[12][0-9]|3[01])\\/(19[0-9]{2}|200[0-9]|201[0-8])$", val:"" },
	{name: "mail", placeholder: "mail@example.es", type: "email", required: "true", val:""}, 
	{name: "secondMail", placeholder:"dirección de correo secundaria", type: "email", val:""}, 
	{name: "phoneNumber", placeholder:"numero de telefono", type: "text" , pattern:"\\d{9}", val: ""}, 
	{name: "password", placeholder:"tu contraseña", type: "password", required: "true", val: "", }, 
	{name: "password2", placeholder:"Vuelva a escribir la contraseña", type: "password", required: "true", val: ""}, 
	{type: "submit", val:"Enviar", class:"send", val: ""}
],login:[
	{name:"user", placeholder:"nick or mail", type: "text", required: "true"},
	{name:"password", placeholder:"Tu contraseña", type: "password", required: "true"},
	{type: "submit", val:"Enviar", class:"send"}
]};
loginScope.vueData.changeForm = {login: ["No tienes cuenta aún? puedes crear una ahora mismo! solo clicka en", " crear cuenta"], newUser: ["Ya tienes cuenta??", " vamos a entrar!"]}
loginScope.vueData.title = {login: "login", newUser:"Registro"};
loginScope.vueData.action = 'login';
loginScope.vueData.passwordSecurity = '';
loginScope.vueData.moduleClass = '';
loginScope.vueData.marginForms = 0;
loginScope.vueData.totalScreen = parseInt(loginScope.vueData.form.newUser.length/3);
loginScope.vueData.styleObjectForm = {"margin-left": 0};
loginScope.vueData.mainStyle = {};
loginScope.vueData.current = 0;
loginScope.vueData.next = 1;

//declaración de los metodos necesarias para las acciones realizadas con vue
loginScope.vueMethods.changeAction = () => loginScope.vueData.action = loginScope.vueData.action==='login' ? 'newUser' : 'login';
loginScope.vueMethods.goToSection =async (ind) => {
	/*
	 *metodo encargado de cambir de sección simulando un scroll infinito
	*/
	loginScope.vueData.next = ind;
	loginScope.vueData.mainStyle = {"transition-duration":".75s", "margin-top": "-50%"};
	await sleep(750);
	loginScope.vueData.mainStyle = {};
	loginScope.vueData.current = ind;
	loginScope.vueData.next = ind+1;
};
loginScope.vueMethods.goTo = (dir) => {
	/*
	 *metodo encargado de cambiar de sección entre el login, info y ayuda
	*/
	if ((loginScope.vueData.marginForms == 0&& dir) || (loginScope.vueData.marginForms ==  loginScope.vueData.totalScreen-1 && !dir)) return;
	loginScope.vueData.marginForms =(dir) ? loginScope.vueData.marginForms -1:loginScope.vueData.marginForms +1;
	loginScope.vueData.styleObjectForm["margin-left"] = -loginScope.vueData.marginForms *100 + "vw";
};


loginScope.vue = new Vue({el: '#root', data: loginScope.vueData, methods: loginScope.vueMethods});
//declaración de los metodos propios
loginScope.sendForm = (e) => {
	let method = $(e.currentTarget).attr('id');
	let input = $(e.currentTarget).find('input');
	e.preventDefault();
	let formObj = {};
	for (let i of input)
		if ($(i).attr('type') !== 'submit' && $(i).attr('name') !== 'password2'&& $(i).val() !== '')
			formObj[$(i).attr('name')] = $(i).val()
	if (method === 'login') formObj.id = document.cookie;
	if (loginScope.searchifEqual()){
		comunication.send('event', formObj, 'login', method, 'loginScope', 'loginFunct')
	}
};

loginScope.loginFunct = (data) =>{
	switch(data.access){
		case true:
			return window.location.href = "desktop";
			break;
		case false:
			return loginScope.vueData.message = "Contraseño o contraseña incorrecta.";
			break;
		case 'itExist':
			return loginScope.vueData.message = "ups parece que ese usuario ya existe.";
			break;
		case 'register':
			return loginScope.vueData.message = "Se ha registrado correctamente"
			break;
		default:
			return loginScope.vueData.message = "Lo has conseguido. Has hecho algo que no hemos contemplado. Enhorabuena ;)\n has obtenido "+data.access
			break;
	}
};
loginScope.psswordValidate = (e) =>{
	/*
	 * Metodo encargado de determinar el grado de seguridad de una constraseña, tomando como referencia
	 * la página de https://support.zendesk.com/hc/es/articles/203663736-Configuraci%C3%B3n-del-nivel-de-seguridad-de-contrase%C3%B1as-Professional-y-Enterprise-
	 * En dicha web se establecen tres niveles de seguridad. En esta función no se siguen al pie de la letra ya que no se terminan de adaptar
	 * a la aplicación que se desarrolla. Este metodo será llamadado cuando el usuario ponga levante la tecla del input de la contraseña
	*/ 
	let val = e.currentTarget.value,
		str = 'la calidad de tu contraseña es ',
		index = loginScope.vueData.form.newUser.findIndex((e)=> e.name==='password'),
		muybaja = /^\w{0,4}$/,
		baja = /^(?=.*[a-z])(?=.*[A-Z])([^ ]){4,}$/,
		media = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\d)([^ ]){8,}$/,
		alta = regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!*?&#*-+])([^ ]){12,}$/,
		muyalta = regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&#*-+])([^ ]){16,}$/;
	if (val.length ==0) loginScope.vueData.form.newUser[index].message = ''; 
	else if (muyalta.test(val)) loginScope.vueData.form.newUser[index].message = str +'muy alta';
	else if (alta.test(val)) loginScope.vueData.form.newUser[index].message = str+'alta'; 
	else if (media.test(val)) loginScope.vueData.form.newUser[index].message = str+'media'; 
	else if (baja.test(val)) loginScope.vueData.form.newUser[index].message = str+'baja'; 
	else if (muybaja.test(val)) loginScope.vueData.form.newUser[index].message =str+'baja'; 
	else loginScope.vueData.form.newUser[index].message = ''; 
};
//loginScope.dateFormate = (e) =>  (e.currentTarget.value.length === 2 ||e.currentTarget.value.length === 5) ?  e.currentTarget.value += "/" : null;
loginScope.setPositon = (e) => {
	/*
	 *función encargada de determinar a que input debe moverse cuando se usa la navegación por tab
	 *Solo se activa con las teclas tab(9) y shift (16) y con los inputs ultimo o primero de cada pantalla
	 *ind es el valor del indice. Tiene que ser un valor que cumpla la condición (++ind%3 ===0) es decir, estar el útlimo o ind%3==0 (estar el primero)
	 *Si está el último solo se activa con la tecla tabs, si está el primero, solo si es las teclas shif y tab, es decir, retrodecer
	 *Para determinar que teclas estan presionadas se usa keyPressed, diccionario que establece su valor en true o false dependiendo si están pulsadas o no
	 *y la función keyUp que salta cuando se levanta una tecla en estos inputs solo si es una de estas dos posibilidades.
	*/
	let ind = $(e.currentTarget).index('#newUser input');
	if ((ind===0) || (e.keyCode !== 9 && e.keyCode !== 16) || (ind%3 !==0 && (ind+1)%3!==0)) return;
	loginScope.keyPressed[e.keyCode] = true;
	if (ind%3 ===0 && (loginScope.keyPressed['9'] && loginScope.keyPressed['16'])) {loginScope.vueMethods.goTo(true); e.preventDefault();}
	else if (++ind%3 ===0 && (loginScope.keyPressed['9'] && !loginScope.keyPressed['16'])) {loginScope.vueMethods.goTo(false); e.preventDefault();}
};
loginScope.keyUp = (e) => {
	if (e.keyCode !== 9 && e.keyCode !== 16) return;
	loginScope.keyPressed[e.keyCode] = false;
};

loginScope.searchifEqual = () => {
	let index = loginScope.vueData.form.newUser.findIndex((d)=>d.name==='password2');
	if ($('#newUser #password2').val() === $('#newUser #password').val()){
		loginScope.areEqual = true;
		loginScope.vueData.form.newUser[index].message = '';
	}
	else{
		loginScope.areEqual =false;
		$('#newUser #password2').focus();
		loginScope.vueData.form.newUser[index].message = 'Ups, parece que las contraseñas no coinciden';
	}
	loginScope.vue.$forceUpdate();
	return loginScope.areEqual;
};
$('body')
.on('submit', 'login form', loginScope.sendForm)
.on('keyup','#newUser #password', loginScope.psswordValidate)
.on('blur','#newUser #password2', loginScope.searchifEqual)
//.on('keyup','#newUser #birthday', loginScope.dateFormate)
.on('keydown', '#newUser span input',loginScope.setPositon)
.on('keyup', '#newUser span input',loginScope.keyUp)
