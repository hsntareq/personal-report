import React from 'react';
import { logoutUser } from '../firebase/auth';
import { useAuth } from '../hooks/useAuth';
import ProfileTargets from './ProfileTargets';

const Dashboard: React.FC = () => {
	const { userData } = useAuth();

	const handleLogout = async () => {
		try {
			await logoutUser();
		} catch (error) {
			console.error('Error signing out:', error);
		}
	};

	return (
		<div className="dashboard-container">
			<div className="dashboard-header">
				<h1>Welcome {userData?.displayName}</h1>
				<button onClick={handleLogout} className="logout-button">
					Logout
				</button>
			</div>

			<div className="user-info">
				{userData?.displayName && (
					<div className="info-item">
						<strong>Display Name:</strong> {userData.displayName}
					</div>
				)}
			</div>

			<ProfileTargets />
		</div>
	);
};

export default Dashboard;
