import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Home.scss";

const Home = () => {
  return (
    <main className="home">
      <div className="home-content">
        <h1 className="home-title">Welcome to Language Learner</h1>
        <Link to="/game" className="home-cta">
          Start Practicing
        </Link>
      </div>
    </main>
  );
};

export default Home;
