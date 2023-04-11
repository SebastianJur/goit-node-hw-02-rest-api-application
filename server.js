const app = require('./app');
const createDir = require('./helpers/helpers');

const foldersToCreate = ['./tmp', './public', './public/avatars'];

app.listen(3000, () => {
	foldersToCreate.forEach(async (createFolder) => {
		await createDir(createFolder);
	});
	console.log('Server running. Use our API on port: 3000');
});