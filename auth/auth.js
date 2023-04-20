const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const { getUserByEmail } = require('../controllers/users');


const auth = async (req, res, next) => {
	const token = req.header('Authorization');

	if (!token) {
		return res.status(401).json({ message: 'Authorization denied' });
	}

	try {
		jwt.verify(token, jwtSecret);
		req.user = jwt.decode(token);

		try {
			const user = await getUserByEmail(req.user.email);
			if (!user) {
				return res.status(401).json({ message: 'Not authorized' });
			}

			if (!user.verify) {
				return res.status(401).json({ message: 'Email is not verified' });
			}
		} catch (error) {
			return res.status(401).json({ message: 'Not authorized' });
		}

		next();
	} catch (error) {
		res.status(401).json({ message: 'Not authorized' });
	}
};

module.exports = auth;