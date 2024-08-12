import { useState, useEffect } from 'react';
import { FaFolder, FaFile, FaChevronLeft } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

const Main = () => {
	const [files, setFiles] = useState([]);
	const [folders, setFolders] = useState([]);
	const [currentPath, setCurrentPath] = useState([]);
	const [currentFolderFiles, setCurrentFolderFiles] = useState([]);
	const [currentFolderName, setCurrentFolderName] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			navigate('/login');
			return;
		}

		const fetchMetadata = async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get(`${API_URL}/metadata`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const { data } = response;

				setFiles(data.filter((item) => !item.isDirectory));
				setFolders(data.filter((item) => item.isDirectory));
			} catch (error) {
				console.error('Failed to fetch metadata', error);
			}
		};

		fetchMetadata();
	}, []);

	useEffect(() => {
		const fetchFolderContents = async () => {
			if (currentPath.length > 0) {
				const folderName = currentPath[currentPath.length - 1];
				try {
					const token = localStorage.getItem('token');
					const response = await axios.get(`${API_URL}/folder/${folderName}`, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});
					setCurrentFolderFiles(response.data);
				} catch (error) {
					console.error('Failed to fetch folder contents', error);
				}
			}
		};

		fetchFolderContents();
	}, [currentPath]);

	const handleFileUpload = async (event) => {
		const uploadedFiles = event.target.files;
		const formData = new FormData();
		for (const file of uploadedFiles) {
			formData.append('files', file);
		}

		try {
			const token = localStorage.getItem('token');
			await axios.post(`${API_URL}/upload/files`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${token}`,
				},
			});
			// Refresh metadata after upload
			const response = await axios.get(`${API_URL}/metadata`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setFiles(response.data.filter((item) => !item.isDirectory));
			setFolders(response.data.filter((item) => item.isDirectory));
		} catch (error) {
			console.error('Failed to upload files', error);
		}
	};

	const handleFolderUpload = async (event) => {
		const uploadedFiles = Array.from(event.target.files);
		const folderName = uploadedFiles[0].webkitRelativePath.split('/')[0];

		const filesData = uploadedFiles.map((file) => ({
			name: file.webkitRelativePath.replace(`${folderName}/`, ''),
			content: URL.createObjectURL(file),
		}));

		try {
			const token = localStorage.getItem('token');
			await axios.post(
				`${API_URL}/upload/folders`,
				{
					folderName,
					files: filesData,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			// Refresh metadata after folder upload
			const response = await axios.get(`${API_URL}/metadata`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			setFiles(response.data.filter((item) => !item.isDirectory));
			setFolders(response.data.filter((item) => item.isDirectory));
		} catch (error) {
			console.error('Failed to upload folder', error);
		}
	};

	const handleNavigate = async (folderName) => {
		setCurrentPath((prevPath) => [...prevPath, folderName]);
		setCurrentFolderName(folderName);
	};

	const handleGoBack = () => {
		setCurrentPath((prevPath) => prevPath.slice(0, -1));
		const parentFolder = currentPath[currentPath.length - 2];
		if (parentFolder) {
			setCurrentFolderFiles(
				folders.find((folder) => folder.name === parentFolder)?.files || []
			);
		} else {
			setCurrentFolderFiles([]);
		}
	};

	return (
		<div className='p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md'>
			<div className='flex space-x-6 mb-4'>
				<div className='flex flex-col items-center'>
					<label className='cursor-pointer bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors duration-300'>
						<p className='text-sm font-semibold'>Upload File</p>
						<FaFile size={24} />
						<input
							type='file'
							onChange={handleFileUpload}
							className='hidden'
							multiple
						/>
					</label>
				</div>
				<div className='flex flex-col items-center'>
					<label className='cursor-pointer bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors duration-300'>
						<p className='text-sm font-semibold'>Upload Folder</p>
						<FaFolder size={24} />
						<input
							type='file'
							webkitdirectory='true'
							directory='true'
							onChange={handleFolderUpload}
							className='hidden'
						/>
					</label>
				</div>
			</div>

			{currentPath.length > 0 && (
				<div className='mb-4'>
					<button
						className='flex items-center text-gray-700 hover:text-gray-900'
						onClick={handleGoBack}
					>
						<FaChevronLeft className='mr-2' /> Back
					</button>
				</div>
			)}

			<div className='mb-6'>
				<p className='text-gray-700 font-medium'>
					Current Path: {currentPath.join(' / ')}
				</p>
			</div>

			{currentFolderName ? (
				<div>
					<div className='p-2 bg-gray-100 rounded-lg mb-2'>
						<p className='text-gray-700 font-medium'>Files:</p>
						<ul className='list-disc list-inside'>
							{currentFolderFiles.map((file, index) => (
								<li key={index} className='text-gray-900'>
									{file.name}
								</li>
							))}
						</ul>
					</div>
					<div className='p-2 bg-gray-100 rounded-lg'>
						<p className='text-gray-700 font-medium'>Folders:</p>
						<ul className='list-disc list-inside'>
							{folders
								.filter((folder) => folder.name !== currentFolderName)
								.map((folder, index) => (
									<li
										key={index}
										className='text-gray-900 cursor-pointer'
										onClick={() => handleNavigate(folder.name)}
									>
										<FaFolder className='inline mr-2' /> {folder.name}
									</li>
								))}
						</ul>
					</div>
				</div>
			) : (
				<div>
					<div className='p-2 bg-gray-100 rounded-lg mb-2'>
						<p className='text-gray-700 font-medium'>Files:</p>
						<ul className='list-disc list-inside'>
							{files.map((file, index) => (
								<li key={index} className='text-gray-900'>
									{file.name}
								</li>
							))}
						</ul>
					</div>
					<div className='p-2 bg-gray-100 rounded-lg'>
						<p className='text-gray-700 font-medium'>Folders:</p>
						<ul className='list-disc list-inside'>
							{folders.map((folder, index) => (
								<li
									key={index}
									className='text-gray-900 cursor-pointer'
									onClick={() => handleNavigate(folder.name)}
								>
									<FaFolder className='inline mr-2' /> {folder.name}
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
};

export default Main;
