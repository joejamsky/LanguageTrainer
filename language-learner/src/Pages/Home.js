import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Home.scss";

const Home = () => {
  return (
    <main className="home">
      <div className="home-content">
        <h1 className="home-title">Welcome to Language Learner</h1>
        <Link to="/setup" className="home-cta">
          Choose Your Level
        </Link>
      </div>
    </main>
  );
};

export default Home;
