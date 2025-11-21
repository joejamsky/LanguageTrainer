import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Home.scss";
import PageNav from "../Components/PageNav";

const Home = () => {
  return (
    <main className="home">
      <PageNav />
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
