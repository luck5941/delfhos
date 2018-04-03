function FORM() {
	/*
	 *Modulo encargado de gestionar todas las entradas con el formulario
	*/
	this.newUser = (data) => {
		ddbb.insert({user: data});
	};
};
module.exports = FORM;
