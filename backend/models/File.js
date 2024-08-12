const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
	name: String,
	path: String,
	isDirectory: Boolean,
	parent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Folder',
		default: null,
	},
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Добавлено поле user
});

const folderSchema = new mongoose.Schema({
	name: String,
	path: String,
	parent: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Folder',
		default: null,
	},
	files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
	subfolders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Добавлено поле user
});

const File = mongoose.model('File', fileSchema);
const Folder = mongoose.model('Folder', folderSchema);

module.exports = { File, Folder };
