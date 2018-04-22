function mongoDB(bbdd_name) {
	var sleep = (ms) => new Promise((resolve, reyect)=> setTimeout(resolve,))
	const MongoClient = require('mongodb').MongoClient;
	this.name = bbdd_name;
	this.init = ()=> {
		console.info("se va a iniciar la conexion en "+ this.name);
		MongoClient.connect('mongodb://127.0.0.1:27017/', (err, db) => {
			if (err) return console.error(err);
			console.info("conexion iniciada");
			this.conn = db.db(this.name);
			this.db = db;
		});
	};
	this.newCollection = (name) => {
		this.conn.createCollection(name, (e, r) => {
			if (e) return console.error (e);
		});
	};
	this.insert = async (obj)=> {
		/*
		 *metodo encargado de insertar un nuevo valor en el docuemento
		 *obj:Object -> el contenedor da el nombre del documento o colección y dentro se hayan los datos a insertar
		 * _ejemplo_ {collection: {data: "val1", data2: "val2}}
		 */

		if (typeof(obj) === 'string') obj = JSON.parse(obj);
		let o = Object.keys(obj)[0];
		let method = Array.isArray(obj[o]) ? "insertMany":"insertOne";
		let code = '';
		let end = false;
		this.conn.collection(o)[method](obj[o], (e, d) => {
			code = (e) ? e.code : d.ops[0];
			end = true;			
		});
		while(!end)
			await sleep(5);
		return code
		
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
	this.aggregate = (collection, ...args) =>{		
		return this.conn.collection(collection).aggregate(args).toArray();
	};
	this.update = (obj, field) => {
		/*
		 *metodo encargado de actualizar un campo en una colección
		 *Obj:Object ->  La condición que determina que documento se actualiza. Se organiza igual que en insert
		 *field:Object-> Los campos ye el valor que que deben ser actualizados y deben tomar
		*/
		if (typeof(obj) === 'string') obj = JSON.parse(obj);
		let collection = Object.keys(obj)[0];
		this.conn.collection(collection).updateMany(obj[collection],{$set: field}, (err, res) => {if (err) return console.error(err);});
		
	}
	this.exit = () => {
		this.db.close();
		console.info("conexion cerrada");
	};
};
module.exports = mongoDB

