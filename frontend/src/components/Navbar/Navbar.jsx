import React from "react";
import "./navbar.css"; // Import the CSS file
import spotify from "../../../assets/spotify.png";
function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Vibify</div>
      <ul className="nav-links">
        <li><a href="https://open.spotify.com/">Made for spotify</a></li>
        <li><img src={spotify}/></li>
      </ul>
    </nav>
  );
}

export default Navbar;
