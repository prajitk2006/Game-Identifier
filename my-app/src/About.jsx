import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about">
      <div className="container">
        <h1>About Game Identifier</h1>
        <p>
          Game Identifier is an AI-powered application that helps gamers identify games
          from screenshots. Simply upload a screenshot, and our machine learning model
          will identify the game for you.
        </p>
        <p>
          All identified games are saved to your personal database, allowing you to
          track and review your game identification history.
        </p>
      </div>
    </div>
  );
};

export default About;
