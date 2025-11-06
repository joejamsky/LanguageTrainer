import React from "react";
import { Link } from "react-router-dom";
import "../Styles/Setup.scss";

const Setup = () => {
  return (
    <main className="setup">
      <div className="setup-content">
        <h1 className="setup-title">Choose Your Level</h1>
        <p className="setup-subtitle">
          Pick the challenge that fits you best. We&apos;ll tailor the practice round once you decide.
        </p>
        <div className="setup-actions">
          <Link to="/game" className="setup-start">
            Continue
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Setup;
