function mongoDB(bbdd_name) {
	const MongoClient = require('mongodb').MongoClient;
	this.name = bbdd_name;
	this.init = ()=> {
		console.log("se va a iniciar la conexion en "+ this.name);
		MongoClient.connect('mongodb://127.0.0.1:27017/', (err, db) => {
			if (err) return console.error(err);
			console.log("conexion iniciada");
			this.conn = db.db(this.name);
			this.db = db;
		});
	};
	this.newCollection = (name) => {
		this.conn.createCollection(name, (e, r) => {
			if (e) return console.error (e);
			console.log("colección creada");
		});
	};
	this.insert = (obj)=> {
		/*
		 *metodo encargado de insertar un nuevo valor en el docuemento
		 *obj:Object -> el contenedor da el nombre del documento o colección y dentro se hayan los datos a insertar
		 * _ejemplo_ {collection: {data: "val1", data2: "val2}}
		 */
		if (typeof(obj) === 'string') obj = JSON.parse(obj);
		for (let o in obj){
			let method = Array.isArray(obj[o]) ? "insertMany":"insertOne";
			this.conn.collection(o)[method](obj[o], (e) => (e) ? console.error(e) : null);
		}
	};
	this.query = (obj, field = {}) => {
		/*
		 *metodo encargado de preguntar si existe un valor y devolver el correspondiente
		 * obj: Object -> Se estructura igual que en insert. Dictamina los match que se deben dar para que se considere una coincidencia
		 * field: Obj -> el filtro que se debe tener en cuenta a la hora de pasar la pregunta
		*/
		if (typeof(obj) === 'string') obj = JSON.parse(obj);
		let collection = Object.keys(obj)[0];
		let answer = this.conn.collection(collection).find(obj[collection], field).toArray();
		return answer;
	};
	this.update = (obj, field) => {
		/*
		 *metodo encargado de actualizar un campo en una colección
		 *Obj:Object ->  La condición que determina que documento se actualiza. Se organiza igual que en insert
		 *field:Object-> Los campos ye el valor que que deben ser actualizados y deben tomar
		*/
		if (typeof(obj) === 'string') obj = JSON.parse(obj);
		let collection = Object.keys(obj)[0];
		console.log(obj[collection]);
		console.log(field);
		this.conn.collection(collection).updateMany(obj[collection],{$set: field}, (err, res) => {if (err) return console.log(err); console.log(res.result.nModified)});
		
	}
	this.exit = () => {
		this.db.close();
		console.log("conexion cerrada");
	};
};
module.exports = mongoDB

