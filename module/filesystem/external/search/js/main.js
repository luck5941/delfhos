var searchScope = {};
searchScope.selectedFriends = [];
searchScope.vueData = {};
searchScope.vueMethod = {};
searchScope.vueData.searchName = '';
searchScope.vueData.match = [];
searchScope.vueData.friends = [];
comunication.send('event', '', 'filesystem','askForFriends', 'searchScope', 'getFriends');

searchScope.getFriends  = (data) => {
console.log(data);
searchScope.vueData.friends = data;
};
searchScope.displayContact  = (data) =>{
	console.log(data);
	 searchScope.vueData.match = data;
};

searchScope.vueMethod.searchUser = () => {
	console.log("buscamos a "+searchScope.vueData.searchName);
	comunication.send('event',[searchScope.vueData.searchName], 'filesystem','searchUser', 'searchScope', 'displayContact');

};
searchScope.vueMethod.selectUser = (user) => {
	/*
	 *metodo encargado de selecionar usuarios. Automaticamente se muestran
	 *en la lista de amigos, pero solo serán guardados como tal si se comparte
	 *con ellos los datos
	*/
	console.log(user);
	searchScope.selectedFriends.push(user);
	searchScope.vueData.friends.push(user);
};
searchScope.vueMethod.acept = () => {
	/*
	 *metodo encargado de enviar a la base de datos
	 *la lista de usuarios con los que se comparte el archivo 
	*/
	comunication.send('event',[searchScope.selectedFriends], 'filesystem','shareFiles', 'searchScope', 'displayContact');
};
searchScope.vue = new Vue({'el': '#search', data: searchScope.vueData, methods: searchScope.vueMethod});
