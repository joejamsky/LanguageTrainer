import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button";
import "../../styles/pages/home.scss";

const Home = () => {
  const navigate = useNavigate();

  return (
    <main className="gutter-container home">
      <div className="home-content">
        <h1 className="home-title">Welcome to Language Learner</h1>
        <div className="home-actions">
          <Button className="home-start" onClick={() => navigate("/mode")}>
            Start Learning
          </Button>
          <Button variant="secondary" onClick={() => navigate("/options")}>
            Options
          </Button>
          <Button variant="secondary" onClick={() => navigate("/stats")}>
            Stats
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Home;
