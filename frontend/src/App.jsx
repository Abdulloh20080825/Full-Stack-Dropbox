import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main';
import Header from './components/Header';
import axios from 'axios';

const App = () => {
	const [user, setUser] = useState({});
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem('token');
		const getUser = async () => {
			try {
				const response = await axios.get('http://localhost:5000/api/user', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setUser(response.data);
			} catch (error) {
				console.log(error);
				if (error.response && error.response.status === 401) {
					navigate('/login');
				}
			}
		};

		getUser();
	}, [navigate]);

	return (
		<div className='bg-slate-900 h-screen text-white'>
			<Header user={user} />
			<Routes>
				<Route index element={<Main />} />
				<Route path='/login' element={<Login />} />
				<Route path='/register' element={<Register />} />
			</Routes>
		</div>
	);
};

export default App;
