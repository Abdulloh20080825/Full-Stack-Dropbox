const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password) {
		return res.status(400).json({ message: 'All fields are required.' });
	}

	try {
		const hashedPassword = await bcrypt.hash(password, 10);

		const user = new User({
			username,
			email,
			password: hashedPassword,
		});

		await user.save();

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		});

		res.json({ message: 'Registration successful!', token });
	} catch (error) {
		res.status(500).json({ message: 'Registration failed.', error });
	}
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		const match = await bcrypt.compare(password, user.password);
		if (!match) {
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		});
		res.json({ token });
	} catch (error) {
		res.status(500).json({ message: 'Login failed', error });
	}
});
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) return res.sendStatus(401);

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
};

router.get('/user', authenticateToken, async (req, res) => {
	try {
		const user = await User.findById(req.user.userId).select('-password');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: 'Failed to get user', error });
	}
});

module.exports = router;
