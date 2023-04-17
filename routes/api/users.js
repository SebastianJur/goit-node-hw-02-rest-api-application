const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const Jimp = require('jimp');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const userController = require('../../controllers/users');
const {
	userCreateValidationShema,
	userSubscriptionUpdateValidationShema,
} = require('../../models/validator');
const loginHandler = require('../../auth/loginHandler');
const auth = require('../../auth/auth');

const storeAvatar = path.join(process.cwd(), 'tmp');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, storeAvatar);
	},
	filename: (req, file, cb) => {
		cb(null, file.originalname);
	},
	limits: 1048576,
});

const upload = multer({ storage });

router.post('/signup', async (req, res, next) => {
	try {
		const { error } = userCreateValidationShema.validate(req.body);
		if (error) {
			return res.status(400).json({ message: error.message });
		}

		const { email } = req.body;
		const user = await userController.getUserByEmail(email);
		if (user) {
			return res.status(409).json({ message: 'Email in use' });
		}

		const newUser = await userController.createUser(req.body);

		const transporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: {
				user: process.env.USER_EMAIL,
				pass: process.env.USER_PWD,
			},
		});

		const html = `
    		<div>
    			<p>Click on the link below to verify your account</p>
    			<a href='http://localhost:3000/api/users/verify/${newUser.verifyToken}' target='_blank'>VERIFY</a>
    		</div>`;

		const emailOptions = {
			from: '"Sebastian" <example@example.com>',
			to: [`${email}`],
			subject: 'Verification',
			text: 'Mail with verification link',
			html,
		};

		await transporter.sendMail(emailOptions);
		res.status(201).json(newUser);
	} catch (error) {
		next(error);
		return res.status(500).json({ message: 'Something went wrong' });
	}
});

router.post('/login', async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ message: 'Email or password is missing' });
	}

	try {
		const token = await loginHandler(email, password);
		res.status(200).json({ token });
	} catch (error) {
		next(error);
		return res.status(401).json({ message: 'Email or password is wrong' });
	}
});

router.get('/logout', auth, async (req, res, next) => {
	try {
		const { token } = req.body;
		const user = await userController.logout(token);
		res.status(204).json(user);
	} catch (error) {
		next(error);
		return res.status(500).json({ message: 'Something went wrong' });
	}
});

router.get('/current', auth, async (req, res, next) => {
	try {
		const { email } = req.user;
		const user = await userController.getUserByEmail(email);
		res.status(200).json(user);
	} catch (error) {
		next(error);
		return res.status(500).json({ message: 'Something went wrong' });
	}
});

router.patch('/', auth, async (req, res, next) => {
	try {
		const { error } = userSubscriptionUpdateValidationShema.validate(req.body);
		if (error) {
			return res.status(400).json({ message: error.message });
		}
		const { email } = req.user;
		const user = await userController.updateSubscription(email, req.body);
		res.status(200).json(user);
	} catch (error) {
		next(error);
		return res.status(500).json({ message: 'Something went wrong' });
	}
});

router.patch(
	'/avatars',
	auth,
	upload.single('avatar'),
	async (req, res, next) => {
		try {
			const { email } = req.user;
			const { path: tempName, originalname } = req.file;
			const fileName = path.join(storeAvatar, originalname);
			await fs.rename(tempName, fileName);

			const img = await Jimp.read(fileName);
			await img.autocrop().cover(250, 250).quality(60).writeAsync(fileName);

			await fs.rename(
				fileName,
				path.join(process.cwd(), 'public/avatars', originalname)
			);

			const avatarURL = path.join(
				process.cwd(),
				'public/avatars',
				originalname
			);
			const cleanAvatarURL = avatarURL.replace(/\\/g, '/');

			const user = await userController.updateAvatar(email, cleanAvatarURL);
			res.status(200).json(user);
		} catch (error) {
			next(error);
			return res.status(500).json({ message: 'Server error' });
		}
	}
);

router.post('/verify', async (req, res, next) => {
	try {
		const { email } = req.body;
		if (!email) {
			return res.status(400).json({ message: 'Missing required field email' });
		}

		const user = await userController.getUserByEmail(email);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		if (user.verify) {
			return res
				.status(400)
				.json({ message: 'Verification has already been passed' });
		}

		const transporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: {
				user: process.env.USER_EMAIL,
				pass: process.env.USER_PWD,
			},
		});

		const html = `
    	<div>
    		<h1>Verification</h1>
    		<p>Click on the link below to verify your account</p>
    		<a href='http://localhost:3000/api/users/verify/${user.verifyToken}' target='_blank'>VERIFY</a>
    	</div>`;

		const emailOptions = {
			from: '"Sebastian" <example@example.com>',
			to: [`${email}`],
			subject: 'Verification',
			text: 'Mail with verification link',
			html,
		};

		await transporter.sendMail(emailOptions);

		res.status(200).json({ message: 'Verification email sent' });
	} catch (error) {
		next(error);
		return res.status(500).json({ message: 'Server error' });
	}
});

router.get('/verify/:verificationToken', async (req, res, next) => {
	try {
		const { verificationToken } = req.params;
		const user = await userController.verifyUser(verificationToken);

		if (user) {
			return res.status(200).json({ message: 'Verification successful' });
		} else {
			return res.status(404).json({ message: 'User not found' });
		}
	} catch (error) {
		next(error);
		return res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;
