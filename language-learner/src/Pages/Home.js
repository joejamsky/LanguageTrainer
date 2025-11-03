import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <main>
      <h1>Welcome to Language Learner</h1>
      <p>Choose a practice mode to start building your vocabulary skills.</p>
      <Link to="/game">Start Practicing</Link>
    </main>
  );
};

export default Home;
