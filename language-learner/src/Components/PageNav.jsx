import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/PageNav.scss";

const PageNav = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="page-nav">
      <button
        type="button"
        className="page-nav-button page-nav-back"
        onClick={handleBack}
      >
        ← Back
      </button>
      <Link to="/" className="page-nav-button page-nav-home">
        Home
      </Link>
    </div>
  );
};

export default PageNav;
