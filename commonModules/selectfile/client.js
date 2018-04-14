var selectFileScope = {};
/*metodos locales llamados por eventos*/
selectFileScope.selectFile = (e) => {
	e.preventDefault();
	let selectFile = mainScope.currentPath + $(mainScope.selected["file"][0]).find('p').html();
	comunication.send('event', [selectFile], 'desktop','upgradeWallPaper', 'desktopScope', 'updateImg');
};

$('body').on('submit', '#selectFile form', selectFileScope.selectFile);

