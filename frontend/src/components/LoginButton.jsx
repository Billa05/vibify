import React from 'react';
import '../styles/LoginButton.css';

const LoginButton = () => {
  return (
    <a 
      href="http://localhost:8888/login" 
      className="login-button"
    >
      CONNECT WITH SPOTIFY
    </a>
  );
};

export default LoginButton;