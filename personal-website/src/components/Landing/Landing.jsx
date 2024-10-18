import React from "react";
import "./landing.css";
import ibrahim from "../../assets/ibrahim.png";
import { Link } from "react-scroll";
import { FaFacebook, FaTwitter, FaFileAlt } from "react-icons/fa";
import { TiSocialInstagram, TiSocialLinkedin } from "react-icons/ti";

const Landing = () => {
  return (
    <section className="intro">
      <div className="intro-content">
        <div className="intro-text">
          <span className="intro-hello">Hello,</span>
          <h1 className="intro-title">
            I'm <span className="intro-name">Muhammad Ibrahim</span>
          </h1>
          <h2 className="intro-subtitle">Computer Engineer</h2>
          <p className="intro-para">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati,
            amet repellendus temporibus odio eum dicta similique consectetur
            quam libero magnam doloribus quae ad debitis delectus nam quia error
            esse consequatur incidunt?
          </p>
          
          <Link to="resume" smooth={true} duration={500}>
            <button className="btn btn-resume">
              <FaFileAlt /> View Resume
            </button>
          </Link>
        </div>
        <div className="intro-image-container">
  <img src={ibrahim} alt="Muhammad Ibrahim" className="intro-image" />
  <div className="intro-image-circle"></div>
  <div className="social-links">
    <a href="#" aria-label="Facebook">
      <FaFacebook />
    </a>
    <a href="#" aria-label="Twitter">
      <FaTwitter />
    </a>
    <a href="#" aria-label="LinkedIn">
      <TiSocialLinkedin />
    </a>
    <a href="#" aria-label="Instagram">
      <TiSocialInstagram />
    </a>
  </div>
</div>
      </div>
    </section>
  );
};

export default Landing;