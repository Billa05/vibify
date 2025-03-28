import React from "react";
import '../styles/Hero.css';
import spotify_ui from "../assets/spotify_ui.png";
import spotify from "../assets/spotify_dark.png";

function Hero({ onLogin }) {
  return (
    <div className="hero">
      <div>
        <h1>Welcome</h1>
        <h2>vibify is a spotify playlist generator </h2>
        <button className="minimal-btn" onClick={onLogin}>
          sign in<img src={spotify} alt="Spotify logo" />
        </button>
      </div>
      <img src={spotify_ui} alt="Spotify UI preview" />
    </div>
  );
}

export default Hero;