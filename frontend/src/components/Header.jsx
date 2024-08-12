import React from 'react';
import { logog } from '../constants/logo';
import { Link } from 'react-router-dom';

const Header = ({ user }) => {
	return (
		<div className='flex justify-between items-center px-5 py-3'>
			<Link to={'/'}>
				<div className='flex items-center space-x-3 cursor-pointer'>
					<img src={logog} alt='' width={90} className='rounded-[50%]' />
					<p className='text-4xl text-white font-bold'>Dropbox</p>
				</div>
			</Link>

			<div className='flex space-x-10 mr-10'>
				{localStorage.getItem('token') ? (
					<>
						<p className='tracking-wider text-2xl font-semibold'>
							Hello{' '}
							<span className='text-blue-500 capitalize'>{user.username}</span>
						</p>
						<Link to={'/login'} onClick={() => localStorage.clear()}>
							<p className='text-2xl'>Logout</p>
						</Link>
					</>
				) : (
					<>
						<Link to={'/login'}>
							<button className='border py-2 px-5 rounded-lg'>Login</button>
						</Link>
						<Link to={'/register'}>
							<button className='border py-2 px-5 rounded-lg'>Register</button>
						</Link>
					</>
				)}
			</div>
		</div>
	);
};

export default Header;
