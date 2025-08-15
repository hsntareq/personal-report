import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../firebase/auth';

const Dashboard: React.FC = () => {
  const { currentUser, userData } = useAuth();

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
        <h1>Welcome to your Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="user-info">
        <h2>User Information</h2>
        <div className="info-item">
          <strong>Email:</strong> {currentUser?.email}
        </div>
        {userData?.displayName && (
          <div className="info-item">
            <strong>Display Name:</strong> {userData.displayName}
          </div>
        )}
        <div className="info-item">
          <strong>User ID:</strong> {currentUser?.uid}
        </div>
        {userData?.createdAt && (
          <div className="info-item">
            <strong>Account Created:</strong> {userData.createdAt.toDate().toLocaleDateString()}
          </div>
        )}
      </div>
      
      <div className="dashboard-content">
        <h3>Your Data</h3>
        <p>Your user data is securely stored in Firebase Firestore.</p>
        <p>You can extend this dashboard to show more user-specific content.</p>
      </div>
    </div>
  );
};

export default Dashboard;
