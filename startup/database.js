const mongoose = require('mongoose');

const dbpath = process.env.MONGO_SECRET;

if (!dbpath) {
	console.log('Database path is not defined...');
}

const connectDatabase = async () => {
	await mongoose
		.connect(dbpath)
		.then(() => console.log('Database connection successful...'))
		.catch((err) => {
			console.log('Error to connect database:' + err);
			process.exit(1);
		});
};

module.exports = { connectDatabase };