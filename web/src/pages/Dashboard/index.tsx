import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
            </header>
            
            <main className="dashboard-main">
                <section className="dashboard-content">
                    <p>Welcome to your Dashboard</p>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;