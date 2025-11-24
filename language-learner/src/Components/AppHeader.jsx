import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.css";
import "../Styles/AppHeader.scss";

const AppHeader = ({ showHome = true, children }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="app-header">
      <div className="app-header-buttons">
        <button
          type="button"
          className="app-header-button"
          onClick={handleBack}
          aria-label="Go back"
        >
          <span aria-hidden="true">←</span>
        </button>
        {showHome && (
          <Link to="/" className="app-header-button" aria-label="Go home">
            <i className="fas fa-home" aria-hidden="true"></i>
          </Link>
        )}
      </div>
      {children ? <div className="app-header-extras">{children}</div> : null}
    </div>
  );
};

export default AppHeader;
