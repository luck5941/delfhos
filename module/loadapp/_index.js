var loadApp = function (path, configPath, name, toLoad = []) {
	/*
	 * Esta libreria se encarga:
	 * -Cargar el fichero de cofiguración
	 * -Generar los string con todos los modulos
	 *  que se tienen que importar según los plugins que tenga el usuario o
	 *  según que se reciva por argumento al llamar al programa.
	 *
	 * -Cuando genere los script mueve todos los archivos a la carpeta de .buffer
	 *  para cuando se cierre la app borrarlos y nunca afectar a los archivos
	 *  orifinales.
	*/
	function sleep(ms) {return new Promise(resolve => setTimeout(resolve, ms));}

