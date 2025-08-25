import React, { useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Books from './components/Books';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Navigation from './components/Navigation';
import Register from './components/Register';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { useAuth } from './hooks/useAuth';
import './scss/base/App.scss';

const AuthWrapper: React.FC = () => {
	const { currentUser } = useAuth();
	const [isLogin, setIsLogin] = useState(true);

	if (currentUser) {
		return (
			<div className="main-wrapper">
				<Navigation />
				<Routes>
					<Route path="/personal-report/" element={<Dashboard />} />
					<Route path="/personal-report/books" element={<Books />} />
				</Routes>
			</div>
		);
	}

	return (
		<div className="main-container">
			<h1>React Login & Register with Firebase</h1>
			{isLogin ? (
				<Login onSwitchToRegister={() => setIsLogin(false)} />
			) : (
				<Register onSwitchToLogin={() => setIsLogin(true)} />
			)}
		</div>
	);
};

function App() {
	return (
		<AuthProvider>
			<Router>
				<AuthWrapper />
			</Router>
		</AuthProvider>
	);
}

export default App;
