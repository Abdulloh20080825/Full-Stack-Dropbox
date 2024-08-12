import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logog } from '../constants/logo';
import axios from 'axios';

const Register = () => {
	const [username, setUsername] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.post('http://localhost:5000/api/register', {
				username,
				email,
				password,
			});
			console.log(response);
			const { token } = response.data;
			localStorage.setItem('token', token);
			navigate('/');
			setSuccess('Registration successful! Please log in.');
			setError('');
			setUsername('');
			setEmail('');
			setPassword('');
		} catch (error) {
			setError('Registration failed. Please try again.');
			setSuccess('');
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md'
		>
			<div className='text-center mb-6'>
				<p className='text-2xl font-semibold mb-2 text-black'>
					Register to Dropbox
				</p>
				<img
					src={logog}
					alt='Dropbox Logo'
					width={60}
					className='mx-auto rounded-[50%]'
				/>
			</div>
			{error && <p className='text-red-500 text-center mb-4'>{error}</p>}
			{success && <p className='text-green-500 text-center mb-4'>{success}</p>}
			<div className='mb-4'>
				<label
					htmlFor='username'
					className='block text-sm font-medium text-gray-700 mb-1'
				>
					Username
				</label>
				<input
					type='text'
					placeholder='Username'
					name='username'
					id='username'
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className='w-full px-4 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				/>
			</div>
			<div className='mb-4'>
				<label
					htmlFor='email'
					className='block text-sm font-medium text-gray-700 mb-1'
				>
					Email
				</label>
				<input
					type='email'
					placeholder='Email'
					name='email'
					id='email'
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className='w-full px-4 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				/>
			</div>
			<div className='mb-4'>
				<label
					htmlFor='password'
					className='block text-sm font-medium text-gray-700 mb-1'
				>
					Password
				</label>
				<input
					type='password'
					placeholder='Password'
					name='password'
					id='password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className='w-full px-4 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				/>
			</div>
			<p className='text-black mb-4'>
				Already have an account{' '}
				<Link to={'/login'} className='text-sky-500'>
					Login
				</Link>
			</p>
			<div className='text-center'>
				<button
					type='submit'
					className='w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
				>
					Register
				</button>
			</div>
		</form>
	);
};

export default Register;
