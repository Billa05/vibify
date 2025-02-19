import React from "react";
import "./navbar.css";
import { Link } from "react-router-dom";
import spotify from "../../../assets/spotify.png";
function Navbar() {
  return (
    <nav className="navbar">
      <Link to={"/"}>
        <div className="logo">Vibify</div>
      </Link>
      <ul className="nav-links">
        <li><a href="https://open.spotify.com/">Made for spotify</a></li>
        <li><img src={spotify} /></li>
      </ul>
    </nav>
  );
}

export default Navbar;
