const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const path = require('path');
const mongoose = require('mongoose');
const { File, Folder } = require('./models/File');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/auth');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ createParentPath: true }));
app.use('/api', authRoutes);

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

const FILES_DIR = path.join(__dirname, 'uploads');
fs.ensureDirSync(FILES_DIR);
app.post('/upload/files', async (req, res) => {
	if (!req.files || !Array.isArray(req.files.files)) {
		return res.status(400).json({ message: 'No files were uploaded.' });
	}

	const uploadedFiles = req.files.files;
	const userId = req.user._id;
	const filePaths = [];

	try {
		for (const file of uploadedFiles) {
			const uploadPath = path.join(FILES_DIR, file.name);
			await file.mv(uploadPath);

			const fileDoc = new File({
				name: file.name,
				path: uploadPath,
				isDirectory: false,
				user: userId, // Сохраняем userId в документе
			});

			await fileDoc.save();
			filePaths.push(uploadPath);
		}

		res.json({ message: 'Files uploaded successfully.', filePaths });
	} catch (error) {
		res.status(500).json({ message: 'Failed to upload files.', error });
	}
});

app.post('/upload/folders', async (req, res) => {
	const { folderName, files } = req.body;
	const userId = req.user._id; // Получаем ID пользователя из токена

	if (!folderName || !files || !Array.isArray(files)) {
		return res.status(400).json({ message: 'Invalid folder or files data.' });
	}

	const folderPath = path.join(FILES_DIR, folderName);
	fs.ensureDirSync(folderPath);

	try {
		const folderDoc = new Folder({
			name: folderName,
			path: folderPath,
			parent: null,
			user: userId, // Сохраняем userId в документе
		});
		await folderDoc.save();

		for (const file of files) {
			const filePath = path.join(folderPath, file.name);
			await fs.writeFile(filePath, file.content);

			const fileDoc = new File({
				name: file.name,
				path: filePath,
				isDirectory: false,
				parent: folderDoc._id,
				user: userId, // Сохраняем userId в документе
			});

			await fileDoc.save();
			folderDoc.files.push(fileDoc._id);
		}

		await folderDoc.save();
		res.json({ message: 'Folder uploaded successfully.' });
	} catch (error) {
		res.status(500).json({ message: 'Failed to upload folder.', error });
	}
});
app.get('/metadata', authenticateToken, async (req, res) => {
	try {
		const userId = req.user;
		console.log(userId);
		const files = await File.find({ user: userId }).exec();
		const folders = await Folder.find({ user: userId }).exec();

		const metadata = [
			...files,
			...folders.map((folder) => ({
				name: folder.name,
				path: folder.path,
				isDirectory: true,
			})),
		];

		res.json(metadata);
	} catch (error) {
		console.error('Error retrieving metadata:', error); // Логируем ошибку
		res.status(500).json({ message: 'Failed to retrieve metadata.', error });
	}
});

app.get('/folder/:folderName', async (req, res) => {
	const { folderName } = req.params;
	const userId = req.user._id;

	try {
		const folder = await Folder.findOne({ name: folderName, user: userId })
			.populate('files')
			.populate('subfolders')
			.exec();

		if (!folder) {
			return res.status(404).json({ message: 'Folder not found.' });
		}

		res.json({
			files: folder.files.map((file) => file.name),
			subfolders: folder.subfolders.map((subfolder) => subfolder.name),
		});
	} catch (error) {
		res.status(500).json({ message: 'Failed to read folder contents.', error });
	}
});

app.listen(PORT, () => {
	mongoose
		.connect(
			'mongodb+srv://abdullohqurbonov332:L9pa6PJ8krU8DOUs@dropbox.7ftja.mongodb.net/?retryWrites=true&w=majority&appName=Dropbox'
		)
		.then(() => console.log('DB connected'))
		.catch((error) => console.log('Error connecting to DB', error));
	console.log(`Server running on port ${PORT}`);
});
