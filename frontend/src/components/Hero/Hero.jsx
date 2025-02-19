import React from "react";
import "./hero.css";
import spotify_ui from "../../../assets/spotify_ui.png";
import spotify from "../../../assets/spotify_dark.png";

function Hero() {
  return (
    <div className="hero">
      <div>
        <h1>Welcome</h1>
        <h2>vibify is a spotify playlist generator </h2>
        <button className="minimal-btn">sign in<img src = {spotify}/></button>
        <p>or</p>
        <button className="minimal-btn-dark">continue as a guest</button>      
      </div>
      <img src={spotify_ui}/>
    </div>
  );
}

export default Hero;
