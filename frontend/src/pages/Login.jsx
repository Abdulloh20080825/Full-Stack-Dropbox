import { useEffect, useState } from 'react';
import { logog } from '../constants/logo';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await axios.post('http://localhost:5000/api/login', {
				email,
				password,
			});
			localStorage.setItem('token', response.data.token);
			setSuccess('Login successful!');
			setError('');
			navigate('/');
		} catch (error) {
			setError('Login failed. Please try again.');
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
					Login to Dropbox
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
					htmlFor='email'
					className='block text-sm font-medium text-gray-700 mb-1'
				>
					Email
				</label>
				<input
					type='email'
					placeholder='Email'
					name='email'
					autoComplete='off'
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
					autoComplete='off'
					id='password'
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className='w-full px-4 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
				/>
			</div>
			<p className='text-black mb-4'>
				Don't have an account?{' '}
				<Link to={'/register'} className='text-sky-500'>
					Create account
				</Link>
			</p>
			<div className='text-center'>
				<button
					type='submit'
					className='w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
				>
					Log In
				</button>
			</div>
		</form>
	);
};

export default Login;
