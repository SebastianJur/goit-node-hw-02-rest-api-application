const bcrypt = require('bcrypt');

const { getUserByEmail } = require('../controllers/users');
const issueToken = require('./issueToken');

const loginHandler = async (email, password) => {
	const user = await getUserByEmail(email);
	if (!user) {
		throw new Error('Email or password is wrong');
	}

	const userPassword = user.password;
	const result = bcrypt.compareSync(password, userPassword);
	if (result) {
		return issueToken(user);
	} else {
		throw new Error('Email or password is wrong');
	}
};

module.exports = loginHandler;