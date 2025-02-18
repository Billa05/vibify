
import "../../styles/Navbar.css";
import logo from "../../../public/logo.png"; // Ensure this image is in the same folder
//import { useNavigate,Router } from 'react-router-dom';
import { Link } from "react-router-dom";
const Navbar = () => {
  // const navigate = useNavigate();
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <nav className="navbar">
      <div className="nav-links">
        <a href="#home" onClick={() => scrollToSection("home")}>
          Home
        </a>
        
        <a href="#blogs" onClick={() => scrollToSection("blogs")}>
          Blogs
        </a>
        <a href="#milestones" onClick={() => scrollToSection("milestones")}>
          Milestones
        </a>
        <a href="#members" onClick={() => scrollToSection("members")}>
          Members
        </a>
      </div>
      <img src={logo} alt="Logo" className="logo" />
    </nav>
  );
};

export default Navbar;
