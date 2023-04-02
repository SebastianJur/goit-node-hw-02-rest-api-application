const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const issueToken = (user) => {
	const payload = {
		id: user._id,
		email: user.email,
	};
	const token = jwt.sign(payload, jwtSecret, { expiresIn: '24h' });
	return token;
};

module.exports = issueToken;