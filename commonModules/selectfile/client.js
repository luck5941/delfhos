var selectFileScope = {};
/*metodos locales llamados por eventos*/
selectFileScope.selectFile = (e) => {
	e.preventDefault();
	let selectFile = filesystemScope.currentPath + $(filesystemScope.selected["file"][0]).find('p').html();
	filesystemScope.getUri(selectFile);
};

$('body').on('submit', '#selectFile form', selectFileScope.selectFile);

