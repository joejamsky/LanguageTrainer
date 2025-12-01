import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Pages/Home.scss";

const Home = () => {
  return (
    <main className="gutter-container home">
      <div className="home-content">
        <h1 className="home-title">Welcome to Language Learner</h1>
        <div className="home-actions">
          <Link to="/mode" className="home-cta">
            Start Learning
          </Link>
          <Link to="/options" className="home-cta secondary">
            Options
          </Link>
          <Link to="/stats" className="home-cta secondary">
            Stats
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Home;
