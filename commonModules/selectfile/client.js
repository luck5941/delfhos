filesystemScope.selectFile = (e) => {
	e.preventDefault();
	let selectFile = filesystemScope.currentPath + $(filesystemScope.selected["file"][0]).find('p').html();
	filesystemScope.getUri(selectFile);
};

$('body').on('submit', '#selectFile form', filesystemScope.selectFile);

