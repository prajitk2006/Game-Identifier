import React from 'react';
import './Services.css';

const Services = () => {
  return (
    <div className="services">
      <div className="container">
        <h1>Services</h1>
        <div className="service-list">
          <div className="service-item">
            <h3>Game Identification</h3>
            <p>Upload screenshots and get instant game identification</p>
          </div>
          <div className="service-item">
            <h3>History Tracking</h3>
            <p>Keep track of all your identified games</p>
          </div>
          <div className="service-item">
            <h3>Database Storage</h3>
            <p>All your identifications are safely stored</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
